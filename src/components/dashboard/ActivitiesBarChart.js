import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import { CircularProgress, Typography } from '@material-ui/core';

const REQUESTED_WITH = 'webapp';

function ActivitiesBarChart({ filters = {}, compact = false }) {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildFilters = () => {
    const filterParts = [];
    
    // Handle location filters - use the most specific location available
    if (filters.collines && filters.collines.length > 0) {
      const collineId = parseInt(decodeId(filters.collines[0]));
      filterParts.push(`location: ${collineId}`);
    } else if (filters.communes && filters.communes.length > 0) {
      const communeId = parseInt(decodeId(filters.communes[0]));
      filterParts.push(`location_Commune: ${communeId}`);
    } else if (filters.provinces && filters.provinces.length > 0) {
      const provinceId = parseInt(decodeId(filters.provinces[0]));
      filterParts.push(`location_Province: ${provinceId}`);
    }
    
    // Handle year filter
    if (filters.year) {
      filterParts.push(`sensitizationDate_Year: ${filters.year}`);
    }
    
    return filterParts.length > 0 ? `(${filterParts.join(', ')})` : '';
  };

  const loadActivitiesData = async () => {
    setIsLoading(true);
    try {
      const csrfToken = localStorage.getItem('csrfToken');
      const baseHeaders = apiHeaders();
      const filterString = buildFilters();
      
      const response = await fetch(`${baseApiUrl}/graphql`, {
        method: 'post',
        headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
        body: JSON.stringify({
          query: `
            {
              sensitizationTraining${filterString} {
                totalCount
              }
              behaviorChangePromotion${filterString} {
                totalCount
              }
              microProject${filterString} {
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
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: compact ? '240px' : '300px',
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
      height={compact ? 240 : 300}
    />
  );
}

export default ActivitiesBarChart;
