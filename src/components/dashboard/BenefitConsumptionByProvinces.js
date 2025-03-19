import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  Paper,
  Typography,
  CircularProgress,
  Chip,
} from '@material-ui/core';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import Chart from 'react-apexcharts';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  chartContainer: {
    flexGrow: 1,
    minHeight: 300,
    position: 'relative',
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  noDataMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
}));

function BenefitConsumptionByProvinces({ filters }) {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseApiUrl}/graphql`, {
          method: 'post',
          headers: apiHeaders(),
          body: JSON.stringify({
            query: `
              {
                benefitConsumptionByProvince ${filters.year ? `(year: ${filters.year})` : ''} 
                ${filters.benefitPlanId ? `(benefitPlan_Id: "${filters.benefitPlanId.replace(/\D/g, '')}")` : ''} {
                  provinceName
                  provinceCode
                  totalPaid
                  totalAmount
                  beneficiariesActive
                  beneficiariesSuspended
                  beneficiariesSelected
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.data && result.data.benefitConsumptionByProvince) {
          setData({ edges: result.data.benefitConsumptionByProvince.map(item => ({ 
            node: {
              name: item.provinceName,
              code: item.provinceCode,
              countActive: item.beneficiariesActive,
              countSuspended: item.beneficiariesSuspended,
              countSelected: item.beneficiariesSelected
            }
          }))});
        } else {
          setData({ edges: [] });
        }
      } catch (error) {
        console.error('Error fetching province data:', error);
        setData({ edges: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (isLoading) {
    return (
      <Paper className={classes.root}>
        <Typography variant="h6" gutterBottom>Bénéficiaires par Province</Typography>
        <div className={classes.loadingContainer}>
          <CircularProgress />
        </div>
      </Paper>
    );
  }

  if (!data.edges || data.edges.length === 0) {
    return (
      <Paper className={classes.root}>
        <Typography variant="h6" gutterBottom>Bénéficiaires par Province</Typography>
        <div className={classes.noDataMessage}>
          <Typography variant="body1">Aucune donnée disponible</Typography>
        </div>
      </Paper>
    );
  }

  // Prepare chart data for ApexCharts
  const provinceNames = data.edges.map((edge) => edge.node.name);
  const activeData = data.edges.map((edge) => edge.node.countActive || 0);
  const suspendedData = data.edges.map((edge) => edge.node.countSuspended || 0);
  const selectedData = data.edges.map((edge) => edge.node.countSelected || 0);

  const chartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
        endingShape: 'rounded',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: provinceNames,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => val.toLocaleString('fr-FR')
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      y: {
        formatter: (val) => val.toLocaleString('fr-FR')
      },
      theme: 'light',
      x: {
        show: true
      }
    },
    colors: ['#4caf50', '#ff9800', '#2196f3'],
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    }
  };

  const chartSeries = [
    {
      name: 'Actifs',
      data: activeData
    },
    {
      name: 'Suspendus',
      data: suspendedData
    },
    {
      name: 'Sélectionnés',
      data: selectedData
    }
  ];

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" gutterBottom>Bénéficiaires par Province</Typography>

      <div className={classes.chartContainer}>
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="bar"
          height="100%"
        />
      </div>

      <div className={classes.legendContainer}>
        <Chip
          label="Actifs"
          className={classes.chip}
          size="small"
          style={{ backgroundColor: '#4caf50', color: 'white' }}
        />
        <Chip
          label="Suspendus"
          className={classes.chip}
          size="small"
          style={{ backgroundColor: '#ff9800', color: 'white' }}
        />
        <Chip
          label="Sélectionnés"
          className={classes.chip}
          size="small"
          style={{ backgroundColor: '#2196f3', color: 'white' }}
        />
      </div>
    </Paper>
  );
}

export default BenefitConsumptionByProvinces;
