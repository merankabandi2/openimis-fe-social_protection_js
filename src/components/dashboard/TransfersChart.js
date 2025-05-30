import React, { useState, useEffect } from 'react';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import {
  Grid, Typography,
  Paper, CircularProgress, Box, Chip, Avatar,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ReactApexChart from 'react-apexcharts';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';

const styles = (theme) => ({
  paper: {
    marginBottom: theme.spacing(0),
    padding: theme.spacing(0),
    background: 'transparent',
    boxShadow: 'none',
  },
  cardHeader: {
    padding: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  cardContent: {
    padding: theme.spacing(0),
  },
  chartContainer: {
    height: props => props.compact ? 280 : 350,
    position: 'relative',
    '& .apexcharts-canvas': {
      borderRadius: theme.spacing(1),
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  noDataMessage: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  statsContainer: {
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[2],
    },
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  statLabel: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  legendContainer: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
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

function TransfersChart({ classes, theme, filters = {}, compact = false, header = true, optimizedData = null }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTransfersData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: apiHeaders(),
        body: JSON.stringify({
          query: `{ monetaryTransferBeneficiaryData${buildFilter(filters)}  {
      transferType,
      malePaid,
      maleUnpaid,
      femalePaid,
      femaleUnpaid,
      totalPaid,
      totalUnpaid
        }}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transfers data');
      }

      const result = await response.json();
      setData(result.data);
      setError(null);
    } catch (err) {
      console.error('Error loading transfers data:', err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Convert optimized data to the format expected by the chart
  const convertOptimizedData = (optimizedData) => {
    if (!optimizedData) return null;
    
    // Create mock transfer data based on optimized metrics
    const mockTransferData = [
      {
        transferType: "Transfert Monétaire",
        malePaid: Math.round((optimizedData.totalPaidBeneficiaries || 0) * 0.4), // Estimate male beneficiaries
        maleUnpaid: Math.round((optimizedData.totalPlannedBeneficiaries - optimizedData.totalPaidBeneficiaries || 0) * 0.4),
        femalePaid: Math.round((optimizedData.totalPaidBeneficiaries || 0) * 0.6), // Estimate female beneficiaries
        femaleUnpaid: Math.round((optimizedData.totalPlannedBeneficiaries - optimizedData.totalPaidBeneficiaries || 0) * 0.6),
        totalPaid: optimizedData.totalPaidBeneficiaries || 0,
        totalUnpaid: (optimizedData.totalPlannedBeneficiaries || 0) - (optimizedData.totalPaidBeneficiaries || 0)
      }
    ];
    
    return { monetaryTransferBeneficiaryData: mockTransferData };
  };

  useEffect(() => {
    if (optimizedData && Object.keys(optimizedData).length > 0) {
      // Use optimized data
      setLoading(false);
      setError(null);
      setData(convertOptimizedData(optimizedData));
    } else {
      // Fallback to original API call
      loadTransfersData();
    }
  }, [filters, optimizedData]);

  // Format data for ApexCharts
  const formatChartData = (rawData) => {
    if (!rawData?.monetaryTransferBeneficiaryData?.length) {
      return { categories: [], series: [], stats: {} };
    }

    // Calculate total for each type and prepare series data
    let seriesData = rawData.monetaryTransferBeneficiaryData.map((item) => {
      const total = item.malePaid + item.maleUnpaid + item.femalePaid + item.femaleUnpaid;
      const totalPaid = item.malePaid + item.femalePaid;
      const totalUnpaid = item.maleUnpaid + item.femaleUnpaid;
      const paidRate = total > 0 ? (totalPaid / total * 100).toFixed(1) : 0;
      
      return {
        transferType: item.transferType,
        total,
        totalPaid,
        totalUnpaid,
        paidRate,
        malePaid: item.malePaid,
        maleUnpaid: item.maleUnpaid,
        femalePaid: item.femalePaid,
        femaleUnpaid: item.femaleUnpaid,
      };
    });

    // Filter out empty data
    seriesData = seriesData.filter((item) => item.total > 0);

    // Calculate overall stats
    const overallStats = {
      totalBeneficiaries: seriesData.reduce((sum, item) => sum + item.total, 0),
      totalPaid: seriesData.reduce((sum, item) => sum + item.totalPaid, 0),
      totalUnpaid: seriesData.reduce((sum, item) => sum + item.totalUnpaid, 0),
      overallPaidRate: 0,
    };
    overallStats.overallPaidRate = overallStats.totalBeneficiaries > 0 
      ? (overallStats.totalPaid / overallStats.totalBeneficiaries * 100).toFixed(1) 
      : 0;

    // Format transfer type names for display
    const formatTransferType = (type) => {
      // Shorten long transfer type names
      return type
        .replace('Transferts monetaires', 'TM')
        .replace('d\'urgence', 'd\'urg.')
        .replace('aux ménages refugiés', 'Refugiés');
    };

    // Create series for radial chart
    const categories = seriesData.map(item => formatTransferType(item.transferType));
    const series = seriesData.map(item => parseFloat(item.paidRate));

    return { categories, series, seriesData, stats: overallStats };
  };

  const { categories, series, seriesData, stats } = formatChartData(data);

  // Create detail series only when seriesData is available
  const detailSeries = seriesData ? [
    {
      name: 'Paiements Hommes - Effectués',
      data: seriesData.map(item => item.malePaid),
    },
    {
      name: 'Paiements Hommes - En Attente',
      data: seriesData.map(item => item.maleUnpaid),
    },
    {
      name: 'Paiements Femmes - Effectués',
      data: seriesData.map(item => item.femalePaid),
    },
    {
      name: 'Paiements Femmes - En Attente',
      data: seriesData.map(item => item.femaleUnpaid),
    },
  ] : [];

  // Chart options - using a radial bar chart for better visual appeal
  const chartOptions = {
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: '#999',
            opacity: 0.2,
            blur: 2
          }
        },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            fontSize: '16px',
            color: theme.palette.text.primary,
          },
          value: {
            offsetY: 5,
            fontSize: '22px',
            fontWeight: 700,
            color: theme.palette.text.primary,
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    grid: {
      padding: {
        top: -10
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      },
    },
    labels: categories,
    colors: ['#00E396', '#FEB019', '#FF4560', '#775DD0'],
  };

  // Alternative chart for detailed view
  const detailChartOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 8,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '12px',
              fontWeight: 600,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Nombre de paiements',
        style: {
          fontSize: '12px',
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val.toLocaleString('fr-FR') + " paiements";
        },
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      offsetY: 0,
    },
    colors: ['#00D9FF', '#00A3E0', '#FF6B6B', '#FF4757'],
  };


  return (
    <Paper className={classes.paper}>
      <Grid container spacing={2}>
        {header && (
          <div className={classes.cardHeader}>
            <Typography variant="h6" className={classes.title}>
              Enregistrements de Paiements
            </Typography>
          </div>
        )}

        <Grid item xs={12} className={classes.cardContent}>
          {loading && (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box my={2}>
              <Typography color="error" align="center">
                Erreur lors du chargement des données: {error.message}
              </Typography>
            </Box>
          )}

          {!loading && !error && series.length > 0 && (
            <>
              {/* Summary Stats */}
              <div className={classes.statsContainer}>
                <div className={classes.statCard}>
                  <Typography className={classes.statValue}>
                    {stats.totalBeneficiaries.toLocaleString('fr-FR')}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Total Paiements
                  </Typography>
                </div>
                <div className={classes.statCard} style={{ borderColor: '#00E396' }}>
                  <Typography className={classes.statValue} style={{ color: '#00E396' }}>
                    {stats.totalPaid.toLocaleString('fr-FR')}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Effectués ({stats.overallPaidRate}%)
                  </Typography>
                </div>
                <div className={classes.statCard} style={{ borderColor: '#FF4560' }}>
                  <Typography className={classes.statValue} style={{ color: '#FF4560' }}>
                    {stats.totalUnpaid.toLocaleString('fr-FR')}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    En Attente
                  </Typography>
                </div>
              </div>

              {/* Main Chart */}
              <div className={classes.chartContainer}>
                <ReactApexChart
                  options={detailChartOptions}
                  series={detailSeries}
                  type="bar"
                  height="100%"
                />
              </div>

              {/* Transfer Type Details */}
              <Box mt={2}>
                {seriesData.map((item, index) => (
                  <Box key={index} mb={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {item.transferType}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${item.paidRate}% effectué`}
                        style={{
                          backgroundColor: parseFloat(item.paidRate) > 80 ? '#e8f5e9' : '#ffebee',
                          color: parseFloat(item.paidRate) > 80 ? '#2e7d32' : '#c62828',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Typography variant="caption" color="textSecondary">
                        Total paiements: {item.total.toLocaleString('fr-FR')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        • Hommes: {((item.malePaid + item.maleUnpaid) / item.total * 100).toFixed(0)}%
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        • Femmes: {((item.femalePaid + item.femaleUnpaid) / item.total * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {!loading && !error && series.length === 0 && (
            <Box className={classes.noDataMessage}>
              <Typography variant="h6" gutterBottom>
                Aucune donnée disponible
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sélectionnez une année ou modifiez les filtres pour afficher les données
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default withTheme(withStyles(styles)(TransfersChart));
