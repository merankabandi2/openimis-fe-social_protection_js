import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { CircularProgress } from '@material-ui/core';
import {
  formatMessage,
} from '@openimis/fe-core';

function TicketsPieChart({ data: propsData, isLoading: propsIsLoading, filters = {} }) {
  const [data, setData] = useState(propsData || []);
  const [isLoading, setIsLoading] = useState(propsIsLoading || true);
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'pie',
      height: 350,
    },
    labels: [],
    colors: ['#5a8dee', '#ff8f00', '#00d0bd', '#e91e63', '#8e24aa', '#3f51b5', '#ff5722'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          position: 'bottom',
        },
      },
    }],
    tooltip: {
      y: {
        formatter(val) {
          return `${val} Plaintes`;
        },
      },
    },
  });

  const [series, setSeries] = useState([]);

  useEffect(() => {
    // Always use props data if provided
    if (propsData !== undefined) {
      setData(propsData || []);
      setIsLoading(propsIsLoading || false);
    }
  }, [propsData, propsIsLoading]);

  useEffect(() => {
    if (data && data.length) {
      const labels = data.map((item) => item.status == 'Resolved' ? 'Fermée' : 'Ouverte');
      const values = data.map((item) => parseInt(item.count, 10));
      setChartOptions((prevOptions) => ({
        ...prevOptions,
        labels,
      }));
      setSeries(values);
    } else {
      setChartOptions((prevOptions) => ({
        ...prevOptions,
        labels: ['No Data'],
      }));
      setSeries([1]);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px',
      }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ height: '300px' }}>
      {data && data.length ? (
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="pie"
          height={300}
        />
      ) : (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',
        }}
        >
          <p>No ticket data available</p>
        </div>
      )}
    </div>
  );
}

export default TicketsPieChart;
