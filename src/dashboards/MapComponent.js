// App.js
import React from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Button, 
  makeStyles, 
  ThemeProvider, 
  createMuiTheme 
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// Create a custom theme
const theme = createMuiTheme({
  typography: {
    fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#5a8dee',
    },
  },
});

// Custom styles
const useStyles = makeStyles((theme) => ({
  wrapper: {
    backgroundColor: '#f9fbfd',
    minHeight: '100vh',
  },
  contentArea: {
    padding: theme.spacing(3),
  },
  box: {
    backgroundColor: '#fff',
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
    height: '100%',
  },
  box1: {
    background: 'linear-gradient(to right, #5a8dee, #2196f3)',
    color: '#fff',
    '& .apexcharts-series path': {
      stroke: '#fff !important',
    },
  },
  box2: {
    background: 'linear-gradient(to right, #ff8f00, #ffb300)',
    color: '#fff',
    '& .apexcharts-series path': {
      stroke: '#fff !important',
    },
  },
  box3: {
    background: 'linear-gradient(to right, #00d0bd, #00b8a9)',
    color: '#fff',
    '& .apexcharts-series path': {
      stroke: '#fff !important',
    },
  },
  viewCodeBtn: {
    marginBottom: theme.spacing(2),
  },
  chartContainer: {
    height: '350px',
  },
}));

// Mock data functions (similar to what would be in assets/data.js)
const generateData = (count, min, max) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return data;
};

// Dashboard component
function BalkanDashboard() {
  const classes = useStyles();

  // Spark Charts Options
  const sparkOptions = {
    chart: {
      id: 'spark1',
      type: 'line',
      height: 100,
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#fff'],
    tooltip: {
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      marker: {
        show: false,
      },
    },
  };

  // Bar Chart Options
  const barOptions = {
    chart: {
      id: 'bar-chart',
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#5a8dee', '#ff8f00'],
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    },
    yaxis: {
      title: {
        text: '$ (thousands)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `$ ${val} thousands`,
      },
    },
  };

  // Donut Chart Options
  const donutOptions = {
    chart: {
      id: 'donut-chart',
      type: 'donut',
      height: 350,
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    colors: ['#5a8dee', '#ff8f00', '#00d0bd', '#2196f3', '#ffb300'],
    legend: {
      position: 'bottom',
    },
  };

  // Area Chart Options
  const areaOptions = {
    chart: {
      id: 'area-chart',
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    colors: ['#5a8dee', '#00d0bd'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  };

  // Line Chart Options
  const lineOptions = {
    chart: {
      id: 'line-chart',
      type: 'line',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    colors: ['#ff8f00', '#5a8dee'],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    },
    markers: {
      size: 4,
    },
  };

  // Generate mock series data for each chart
  const sparkSeries1 = [{
    name: 'Revenue',
    data: generateData(20, 30, 100),
  }];

  const sparkSeries2 = [{
    name: 'Expenses',
    data: generateData(20, 10, 80),
  }];

  const sparkSeries3 = [{
    name: 'Profit',
    data: generateData(20, 20, 60),
  }];

  const barSeries = [
    {
      name: 'Net Profit',
      data: generateData(7, 30, 70),
    },
    {
      name: 'Revenue',
      data: generateData(7, 50, 100),
    },
  ];

  const donutSeries = generateData(5, 10, 100);

  const areaSeries = [
    {
      name: 'series1',
      data: generateData(9, 20, 80),
    },
    {
      name: 'series2',
      data: generateData(9, 10, 60),
    },
  ];

  const lineSeries = [
    {
      name: 'High',
      data: generateData(9, 40, 90),
    },
    {
      name: 'Low',
      data: generateData(9, 10, 40),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button
              variant="outlined"
              color="primary"
              className={classes.viewCodeBtn}
              startIcon={<GitHubIcon />}
              href="https://github.com/apexcharts/apexcharts.js/tree/master/samples/vanilla-js/dashboards/modern"
              target="_blank"
            >
              View Code
            </Button>
          </Box>
          
          <div className="main">
            <Grid container spacing={4}>
              {/* Sparkboxes Row */}
              <Grid item xs={12} md={4}>
                <Box className={`${classes.box} ${classes.box1}`}>
                  <Chart
                    options={sparkOptions}
                    series={sparkSeries1}
                    type="line"
                    height={100}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box className={`${classes.box} ${classes.box2}`}>
                  <Chart
                    options={sparkOptions}
                    series={sparkSeries2}
                    type="line"
                    height={100}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box className={`${classes.box} ${classes.box3}`}>
                  <Chart
                    options={sparkOptions}
                    series={sparkSeries3}
                    type="line"
                    height={100}
                  />
                </Box>
              </Grid>
              
              {/* Bar and Donut Row */}
              <Grid item xs={12} md={6}>
                <Box className={`${classes.box} ${classes.chartContainer}`}>
                  <Chart
                    options={barOptions}
                    series={barSeries}
                    type="bar"
                    height={350}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className={`${classes.box} ${classes.chartContainer}`}>
                  <Chart
                    options={donutOptions}
                    series={donutSeries}
                    type="donut"
                    height={350}
                  />
                </Box>
              </Grid>
              
              {/* Area and Line Row */}
              <Grid item xs={12} md={6}>
                <Box className={`${classes.box} ${classes.chartContainer}`}>
                  <Chart
                    options={areaOptions}
                    series={areaSeries}
                    type="area"
                    height={350}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box className={`${classes.box} ${classes.chartContainer}`}>
                  <Chart
                    options={lineOptions}
                    series={lineSeries}
                    type="line"
                    height={350}
                  />
                </Box>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default BalkanDashboard;
