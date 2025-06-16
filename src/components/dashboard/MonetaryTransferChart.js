import React, { useState, useMemo } from 'react';
import {
  Card, CardContent, Typography, makeStyles, CircularProgress,
  Switch, FormControlLabel, Box, LinearProgress, Select, MenuItem,
} from '@material-ui/core';
import Chart from 'react-apexcharts';
import { useOptimizedDashboardComponent } from '../../hooks/useOptimizedDashboard';

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
    position: 'relative',
  },
  toggleLabel: {
    marginLeft: theme.spacing(2),
    '& .MuiFormControlLabel-label': {
      fontSize: '0.875rem',
    },
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  aggregationSelect: {
    marginLeft: theme.spacing(2),
    minWidth: 120,
    '& .MuiSelect-select': {
      fontSize: '0.875rem',
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
    },
  },
}));

function MonetaryTransferChart({ filters = {} }) {
  const classes = useStyles();
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const [aggregationLevel, setAggregationLevel] = useState('programme');

  // Use optimized dashboard component hook for transfers with aggregation level
  const { data, isLoading, error, refetch, isRefreshing } = useOptimizedDashboardComponent(
    'transfers',
    { ...filters, aggregation_level: aggregationLevel }
  );

  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!data?.byTransferType) return [];
    
    // The optimized query now includes quarterly breakdown data
    return data.byTransferType.map(item => ({
      transferType: item.transferType,
      q1Amount: item.q1Amount || 0,
      q2Amount: item.q2Amount || 0,
      q3Amount: item.q3Amount || 0,
      q4Amount: item.q4Amount || 0,
      q1Beneficiaries: item.q1Beneficiaries || 0,
      q2Beneficiaries: item.q2Beneficiaries || 0,
      q3Beneficiaries: item.q3Beneficiaries || 0,
      q4Beneficiaries: item.q4Beneficiaries || 0,
    }));
  }, [data]);

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
    // Add metadata for better tooltips
    meta: {
      paymentSource: item.paymentSource,
      femalePercentage: item.femalePercentage,
      twaPercentage: item.twaPercentage,
    }
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
    if (error) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="error">
            Erreur lors du chargement des données
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {error.message || 'Une erreur est survenue'}
          </Typography>
        </Box>
      );
    }

    if (chartData.length === 0 && !isLoading) {
      return (
        <Box p={3} textAlign="center">
          <Typography>Aucune donnée disponible</Typography>
        </Box>
      );
    }

    return (
      <div className={classes.chartContainer}>
        {/* Loading overlay for refresh */}
        {isRefreshing && (
          <div className={classes.loadingOverlay}>
            <CircularProgress size={40} />
          </div>
        )}
        
        {/* Main loading state */}
        {isLoading ? (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <CircularProgress size={60} />
              <Typography style={{ marginTop: 16 }}>Chargement des données...</Typography>
            </div>
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type={showBeneficiaries ? 'line' : 'bar'}
            height={350}
          />
        )}
      </div>
    );
  };

  const handleToggleChange = () => {
    setShowBeneficiaries(!showBeneficiaries);
  };

  const handleAggregationChange = (event) => {
    setAggregationLevel(event.target.value);
  };

  return (
    <Card className={classes.card}>
      {/* Progress bar for loading states */}
      {(isLoading || isRefreshing) && (
        <LinearProgress 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            zIndex: 2 
          }} 
        />
      )}
      
      <div className={classes.cardHeader}>
        <Typography className={classes.title} variant="h6" component="h2">
          Transferts Monétaires par Trimestre (Système + Externe)
        </Typography>
        <Box display="flex" alignItems="center">
          <Select
            value={aggregationLevel}
            onChange={handleAggregationChange}
            className={classes.aggregationSelect}
            disabled={isLoading}
          >
            <MenuItem value="programme">Par Programme</MenuItem>
            <MenuItem value="colline">Par Colline</MenuItem>
          </Select>
          <FormControlLabel
            className={classes.toggleLabel}
            control={(
              <Switch
                checked={showBeneficiaries}
                onChange={handleToggleChange}
                name="chartToggle"
                color="primary"
                disabled={isLoading}
              />
            )}
            label={showBeneficiaries ? 'Bénéficiaires' : 'Montants'}
          />
        </Box>
      </div>
      <CardContent>
        {renderChartContent()}
      </CardContent>
    </Card>
  );
}

export default MonetaryTransferChart;
