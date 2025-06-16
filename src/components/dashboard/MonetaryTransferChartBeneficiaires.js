import React, { useState, useEffect } from 'react';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import {
  Grid, Typography,
  Paper, CircularProgress, Box,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ReactApexChart from 'react-apexcharts';

const styles = (theme) => ({
  paper: {
    marginBottom: theme.spacing(0),
    padding: theme.spacing(2),
  },
  cardHeader: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardContent: {
    padding: theme.spacing(0),
  },
  chartContainer: {
    height: 300,
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

const buildFilter = (filters) => {
  const { locationId, benefitPlanId, year } = filters;

  const itemFilters = {
    year: (val) => `year: ${val}`,
    locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
    benefitPlanId: (val) => `benefitPlanUuid: "${decodeId(val)}"`,
  };

  // Build the filter string
  const filterParts = [];

  // Process year filter (special handling for array results)
  if (itemFilters.year && year) {
    const yearFilter = itemFilters.year(year);
    if (Array.isArray(yearFilter)) {
      filterParts.push(...yearFilter);
    } else {
      filterParts.push(yearFilter);
    }
  }

  if (itemFilters.locationId && locationId) {
    filterParts.push(itemFilters.locationId(locationId));
  }

  if (itemFilters.benefitPlanId && benefitPlanId) {
    filterParts.push(itemFilters.benefitPlanId(benefitPlanId));
  }
  return filterParts.length ? `(${filterParts.join(', ')})` : '';
};

function MonetaryTransferChartBeneficiaires({ classes, theme, filters = {} }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTransfersData = async () => {
    setLoading(true);
    try {
      // Build filters object for optimized query
      const optimizedFilters = {};
      if (filters.year) optimizedFilters.year = filters.year;
      if (filters.locationId) optimizedFilters.provinceId = filters.locationId;
      if (filters.benefitPlanId) optimizedFilters.benefitPlanId = decodeId(filters.benefitPlanId);
      
      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: apiHeaders(),
        body: JSON.stringify({
          query: `query OptimizedMonetaryTransferBeneficiaryData($filters: DashboardFiltersInput) {
            optimizedMonetaryTransferBeneficiaryData(filters: $filters) {
              transferType
              malePaid
              maleUnpaid
              femalePaid
              femaleUnpaid
              totalPaid
              totalUnpaid
            }
          }`,
          variables: {
            filters: optimizedFilters
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transfers data');
      }

      const result = await response.json();
      setData({ monetaryTransferBeneficiaryData: result.data.optimizedMonetaryTransferBeneficiaryData });
      setError(null);
    } catch (err) {
      console.error('Error loading transfers data:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfersData();
  }, [filters]);

  // Format data for ApexCharts
  const formatChartData = (rawData) => {
    if (!rawData?.monetaryTransferBeneficiaryData?.length) {
      return { categories: [], series: [] };
    }

    // Calculate total for each type and prepare series data
    let seriesData = rawData.monetaryTransferBeneficiaryData.map((item) => {
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

    // Extract categories (transfer types)
    const categories = rawData.monetaryTransferBeneficiaryData.map((item) => item.transferType).filter((item, i) => seriesData[i].total > 0);
    seriesData = seriesData.filter((item) => item.total > 0);

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

  // Chart options
  const chartOptions = {
    chart: {
      type: 'bar',
      // stacked: true,
      // stackType: '100%', // This makes it a percentage stacked chart
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
    xaxis: {
      categories,
      labels: {
        formatter(val) {
          return `${Math.round(val)}`;
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
            Transferts Monétaires
          </Typography>
        </div>

        <Grid item xs={12} className={classes.cardContent}>
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
