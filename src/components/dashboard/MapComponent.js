import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
} from '@material-ui/core';
import {
  Map, TileLayer, GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import BoxTable from './BoxTable';

// This is needed to fix Leaflet icon issues in React
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const loadStats = async () => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: apiHeaders(),
    body: JSON.stringify({ query: '{locationByBenefitPlan (benefitPlan_Id: \"452721c3-cc8a-49d9-81f0-a7c7a1a3bf82\") { totalCount edges{node{ id, code, name,countSelected,countSuspended,countActive}}}}' }),
  });
  if (!response.ok) {
    throw response;
  } else {
    const { data } = await response.json();
    return data;
  }
};

function MapComponent({ className }) {
  // State for our data
  const [burundiGeoJSON, setBurundiGeoJSON] = useState(null);
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a lookup object for easy access
  const [locationLookup, setLocationLookup] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Create lookup table by name
        fetch('/front/maps/provinces.geojson') // Adjust the path to your GeoJSON file
          .then((response) => response.json())
          .then((data) => setBurundiGeoJSON(data))
          .catch((error) => console.error('Error loading GeoJSON:', error));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    }

    loadStats().then(
      (data) => {
        console.log([1]);
        const locations = data.locationByBenefitPlan.edges.map((edge) => edge.node);
        setLocationData(locations);
        const lookup = {};
        locations.forEach((loc) => {
          lookup[loc.name] = loc;
        });
        setLocationLookup(lookup);
        fetchData();
      },
    )
      .catch((error) => console.error('Failed to load stats', error));
  }, []);

  // Calculate total count for a location
  const getTotalCount = (location) => location.countSelected + location.countActive + location.countSuspended;

  // Find the max count for color scaling
  const maxCount = locationData.length
    ? Math.max(...locationData.map(getTotalCount)) : 0;

  // Style function for the GeoJSON layers
  const getStyle = (feature) => {
    const locationName = feature.properties.shapeName;
    const locationInfo = locationLookup[locationName];

    if (!locationInfo) {
      return {
        fillColor: '#f0f0f0', weight: 1, opacity: 1, color: '#333', fillOpacity: 0.7,
      };
    }

    const totalCount = getTotalCount(locationInfo);
    const colorIntensity = Math.min(1, totalCount / maxCount);

    // Determine fill color based on active vs selected status
    let fillColor = '#f0f0f0'; // Default light gray
    let dashArray = null;

    if (locationInfo.countActive > 0 && locationInfo.countSelected === 0) {
      // Only active - use green shades
      fillColor = `rgb(0, ${Math.floor(100 + colorIntensity * 155)}, 0)`;
    } else if (locationInfo.countSelected > 0 && locationInfo.countActive === 0) {
      // Only selected - use blue shades
      fillColor = `rgb(0, 0, ${Math.floor(100 + colorIntensity * 155)})`;
    } else if (locationInfo.countActive > 0 && locationInfo.countSelected > 0) {
      // Mixed - use purple shades
      fillColor = `rgb(${Math.floor(50 + colorIntensity * 150)}, 0, ${Math.floor(50 + colorIntensity * 150)})`;
      dashArray = '3';
    }

    return {
      fillColor,
      dashArray,
      weight: 2,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.7,
    };
  };

  // Tooltip content for each region
  const onEachFeature = (feature, layer) => {
    console.log([2]);
    const locationName = feature.properties.shapeName;
    const locationInfo = locationLookup[locationName];
    console.log([feature.properties, feature.properties.shapeName, locationLookup, locationLookup[locationName]]);
    if (locationInfo) {
      layer.bindTooltip(`
        <div style="min-width: 200px;">
          <strong>${locationInfo.name}</strong><br />
          Sélectionnés: ${locationInfo.countSelected.toLocaleString('fr-FR')}<br />
          Actifs: ${locationInfo.countActive.toLocaleString('fr-FR')}<br />
          Total: ${getTotalCount(locationInfo).toLocaleString('fr-FR')}
        </div>
      `);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading map data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <>
      <Grid item xs={12} md={6}>
        <Box className={className}>
          <Map
            center={[-3.39, 29.90]} // Set the initial map center (latitude, longitude)
            zoom={8.3} // Set the initial zoom level
            style={{ height: '500px', width: '480px' }}
            scrollWheelZoom={false}
            zoomSnap={0.1}
            zoomDelta={0.5}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {burundiGeoJSON && locationLookup && (
            <GeoJSON
              data={burundiGeoJSON}
              style={getStyle}
              onEachFeature={onEachFeature}
            />
            )}

          </Map>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box className={className}>
          <BoxTable locationData={locationData} getTotalCount={getTotalCount} />
        </Box>
      </Grid>
    </>
  );
}

export default MapComponent;
