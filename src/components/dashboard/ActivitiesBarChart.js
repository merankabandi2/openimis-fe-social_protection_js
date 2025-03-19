import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import { CircularProgress, Typography } from '@material-ui/core';

function ActivitiesBarChart({ filters = {} }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadActivitiesData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: apiHeaders(),
        body: JSON.stringify({
          query: `
            {
              sensitizationTraining {
                totalCount
              }
              behaviorChangePromotion {
                totalCount
              }
              microProject {
                totalCount
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities data');
      }

      const { data } = await response.json();

      const activities = [
        { type: 'Sensibilisations', count: data.sensitizationTraining.totalCount || 0 },
        { type: 'Promotion du changement de comportement', count: data.behaviorChangePromotion.totalCount || 0 },
        { type: 'Micro projets', count: data.microProject.totalCount || 0 },
      ];

      setChartData(activities);
    } catch (error) {
      console.error('Error loading activities data:', error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivitiesData();
  }, [filters]);

  const options = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      fontFamily: '"Titillium Web", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#5a8dee', '#ff8f00', '#00d0bd'],
    xaxis: {
      categories: chartData.map((item) => item.type),
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter(val) {
          return val.toString();
        },
      },
    },
  };

  const series = [{
    name: 'Activités',
    data: chartData.map((item) => item.count),
  }];

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
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={300}
    />
  );
}

export default ActivitiesBarChart;
