import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGraphqlQuery } from '@openimis/fe-core';
import {
  Grid, Typography, FormControl, InputLabel, Select, MenuItem,
  Paper, CircularProgress, Box,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ReactApexChart from 'react-apexcharts';

const styles = (theme) => ({
  paper: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(3),
  },
  cardHeader: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartContainer: {
    height: 500,
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  noDataMessage: {
    textAlign: 'center',
    padding: theme.spacing(3),
  },
});

const MONETARY_TRANSFER_BENEFICIARY_DATA = `
  query monetaryTransferBeneficiaryData($year: Int) {
    monetaryTransferBeneficiaryData(year: $year) {
      transferType
      malePaid
      maleUnpaid
      femalePaid
      femaleUnpaid
      totalPaid
      totalUnpaid
    }
  }
`;

function MonetaryTransferChartBeneficiaires({ classes, theme }) {
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const { data, error, loading } = useGraphqlQuery(
    MONETARY_TRANSFER_BENEFICIARY_DATA,
    { year },
  );

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  // Format data for ApexCharts
  const formatChartData = (rawData) => {
    if (!rawData?.monetaryTransferBeneficiaryData?.length) {
      return { categories: [], series: [] };
    }

    // Extract categories (transfer types)
    const categories = rawData.monetaryTransferBeneficiaryData.map((item) => item.transferType);

    // Calculate total for each type and prepare series data
    const seriesData = rawData.monetaryTransferBeneficiaryData.map((item) => {
      const total = item.malePaid + item.maleUnpaid + item.femalePaid + item.femaleUnpaid;
      // Return an array of actual values (not percentages) - ApexCharts will handle the percentage conversion
      return {
        total,
        malePaid: item.malePaid,
        maleUnpaid: item.maleUnpaid,
        femalePaid: item.femalePaid,
        femaleUnpaid: item.femaleUnpaid,
      };
    });

    // Create series data structure
    const series = [
      {
        name: 'Hommes Payés',
        data: seriesData.map((item) => item.malePaid),
      },
      {
        name: 'Hommes Non Payés',
        data: seriesData.map((item) => item.maleUnpaid),
      },
      {
        name: 'Femmes Payées',
        data: seriesData.map((item) => item.femalePaid),
      },
      {
        name: 'Femmes Non Payées',
        data: seriesData.map((item) => item.femaleUnpaid),
      },
    ];

    // Store total values for tooltip
    const totals = seriesData.map((item) => item.total);

    return { categories, series, totals };
  };

  const { categories, series, totals } = formatChartData(data);

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Chart options
  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      stackType: '100%', // This makes it a percentage stacked chart
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'middle',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter(val, opts) {
        // Only show percentages if they're significant enough
        return val > 5 ? `${Math.round(val)}%` : '';
      },
      style: {
        fontSize: '12px',
        colors: ['#fff'],
      },
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    title: {
      text: 'Bénéficiaires des Transferts Monétaires par Genre et Statut de Paiement',
    },
    xaxis: {
      categories,
      labels: {
        formatter(val) {
          return `${Math.round(val)}%`;
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter(val, { seriesIndex, dataPointIndex }) {
          const percentage = (val / totals[dataPointIndex] * 100).toFixed(1);
          return `${val} bénéficiaires (${percentage}%)`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    colors: [
      theme.palette.primary.dark, // Hommes Payés
      theme.palette.primary.light, // Hommes Non Payés
      theme.palette.secondary.dark, // Femmes Payées
      theme.palette.secondary.light, // Femmes Non Payées
    ],
  };

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={2}>
        <div className={classes.cardHeader}>
          <Typography variant="h6" className={classes.title}>
            Bénéficiaires des Transferts Monétaires par Genre et Statut de Paiement
          </Typography>
          <FormControl className={classes.formControl}>
            <InputLabel id="year-select-label">Année</InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              onChange={handleYearChange}
            >
              {availableYears.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Grid item xs={12}>
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box my={2}>
              <Typography color="error">
                Erreur lors du chargement des données:
                {' '}
                {error.message}
              </Typography>
            </Box>
          )}

          {!loading && !error && series.length > 0 && (
            <div className={classes.chartContainer}>
              <ReactApexChart
                options={chartOptions}
                series={series}
                type="bar"
                height="100%"
              />
            </div>
          )}

          {!loading && !error && series.length === 0 && (
            <Typography className={classes.noDataMessage}>
              Aucune donnée disponible pour l'année sélectionnée.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default withTheme(withStyles(styles)(MonetaryTransferChartBeneficiaires));
