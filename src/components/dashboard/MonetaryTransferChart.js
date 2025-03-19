import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, makeStyles, CircularProgress,
  Switch, FormControlLabel, Box,
} from '@material-ui/core';
import Chart from 'react-apexcharts';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';

const useStyles = makeStyles((theme) => ({
  card: {
    height: '100%',
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
  },
  cardHeader: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#5e5873',
  },
  chartContainer: {
    marginTop: theme.spacing(2),
  },
  toggleLabel: {
    marginLeft: theme.spacing(2),
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
    },
  },
}));

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

const loadMonetaryTransferData = async (filters) => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: apiHeaders(),
    body: JSON.stringify({
      query: `{ monetaryTransferQuarterlyData${buildFilter(filters)}  {
            transferType
            q1Amount
            q2Amount
            q3Amount
            q4Amount
            q1Beneficiaries
            q2Beneficiaries
            q3Beneficiaries
            q4Beneficiaries
    }}`,
    }),
  });

  if (!response.ok) {
    console.log('loadMonetaryTransferDataok');
    throw response;
  } else {
    console.log('loadMonetaryTransferDatano');
    const { data } = await response.json();
    return data.monetaryTransferQuarterlyData;
  }
};

function MonetaryTransferChart({ filters = {} }) {
  const classes = useStyles();
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    loadMonetaryTransferData(filters)
      .then((data) => {
        setChartData(data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load monetary transfer data', error);
        setIsLoading(false);
      });
  }, [filters]);

  // Prepare data for ApexCharts
  const series = chartData.map((item) => ({
    name: item.transferType,
    data: showBeneficiaries
      ? [
        parseFloat(item.q1Beneficiaries || 0),
        parseFloat(item.q2Beneficiaries || 0),
        parseFloat(item.q3Beneficiaries || 0),
        parseFloat(item.q4Beneficiaries || 0),
      ]
      : [
        parseFloat(item.q1Amount || 0),
        parseFloat(item.q2Amount || 0),
        parseFloat(item.q3Amount || 0),
        parseFloat(item.q4Amount || 0),
      ],
  }));

  const options = {
    chart: {
      type: showBeneficiaries ? 'line' : 'bar',
      stacked: !showBeneficiaries,
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
    plotOptions: showBeneficiaries ? {} : {
      bar: {
        horizontal: false,
        columnWidth: '30%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: showBeneficiaries
      ? {
        curve: 'smooth',
        width: 3,
      }
      : {
        show: true,
        width: 2,
      },
    xaxis: {
      categories: ['T1', 'T2', 'T3', 'T4'],
      title: {
        text: 'Trimestre',
      },
    },
    yaxis: {
      title: {
        text: showBeneficiaries ? 'Nombre de béneficiaires' : 'Montant (BIF)',
      },
      labels: {
        formatter(value) {
          return value.toLocaleString('fr-FR');
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter(val) {
          if (showBeneficiaries) {
            return `${val.toLocaleString('fr-FR')} bénéficiaires`;
          }
          return `${val.toLocaleString('fr-FR')} BIF`;
        },
      },
    },
    legend: {
      position: 'top',
    },
    markers: showBeneficiaries ? { size: 5 } : {},
    colors: ['#5a8dee', '#ff8f00', '#00d0bd', '#ff5c75'],
  };

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div
          className={classes.chartContainer}
          style={{
            height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography style={{ marginTop: 16 }}>Chargement des données...</Typography>
          </div>
        </div>
      );
    }

    if (chartData.length === 0) {
      return <Typography>Aucune donnée disponible</Typography>;
    }

    return (
      <div className={classes.chartContainer}>
        <Chart
          options={options}
          series={series}
          type={showBeneficiaries ? 'line' : 'bar'}
          height={350}
        />
      </div>
    );
  };

  const handleToggleChange = () => {
    setShowBeneficiaries(!showBeneficiaries);
  };

  return (
    <Card className={classes.card}>
      <div className={classes.cardHeader}>
        <Typography className={classes.title} variant="h6" component="h2">
          Transferts Monétaires par Trimestre
        </Typography>
        <FormControlLabel
          className={classes.toggleLabel}
          control={(
            <Switch
              checked={showBeneficiaries}
              onChange={handleToggleChange}
              name="chartToggle"
              color="primary"
            />
          )}
          label={showBeneficiaries ? 'Bénéficiaires' : 'Montants'}
        />
      </div>
      <CardContent>
        {renderChartContent()}
      </CardContent>
    </Card>
  );
}

export default MonetaryTransferChart;
