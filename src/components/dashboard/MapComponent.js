import React, { useState, useEffect, useRef } from 'react';
import {
  Grid,
  Box,
  makeStyles,
} from '@material-ui/core';
import {
  Map, TileLayer, GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { baseApiUrl, apiHeaders } from '@openimis/fe-core';
import L from 'leaflet';
import BoxTable from './BoxTable';

// This is needed to fix Leaflet icon issues in React

const useStyles = makeStyles(() => ({
  mapContainer: {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    position: 'relative',
  },
  tiles: {
    '& img.leaflet-tile.leaflet-tile-loaded': {
      filter: 'grayscale(1)',
    },
  },
}));

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
  const classes = useStyles();
  const mapContainerRef = useRef(null);
  // State for our data
  const [burundiGeoJSON, setBurundiGeoJSON] = useState(null);
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapDimensions, setMapDimensions] = useState({ width: '100%', height: '500px' });

  // Create a lookup object for easy access
  const [locationLookup, setLocationLookup] = useState({});

  // Set up resize observer to update map size when container resizes
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const updateMapDimensions = () => {
      if (mapContainerRef.current) {
        const { offsetWidth, offsetHeight } = mapContainerRef.current.parentElement;
        // Ensure minimum height
        const height = Math.max(500, offsetHeight);
        setMapDimensions({
          width: '100%',
          height: `${height}px`,
        });
      }
    };

    // Initial update
    updateMapDimensions();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(updateMapDimensions);
    resizeObserver.observe(mapContainerRef.current.parentElement);

    // Cleanup
    return () => {
      if (mapContainerRef.current && mapContainerRef.current.parentElement) {
        resizeObserver.unobserve(mapContainerRef.current.parentElement);
      }
      resizeObserver.disconnect();
    };
  }, [mapContainerRef]);

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
        fillColor: '#f0f0f0',
        weight: 1,
        opacity: 0.9,
        color: '#c0c0c0',
        fillOpacity: 0.6,
      };
    }

    const totalCount = getTotalCount(locationInfo);
    const colorIntensity = Math.min(1, totalCount / maxCount);

    // Determine fill color based on active vs selected status
    let fillColor = '#f0f0f0'; // Default light gray
    let dashArray = null;
    const opacity = 0.9;
    const fillOpacity = 0.6 + (colorIntensity * 0.25); // More data = slightly more opaque

    if (locationInfo.countActive > 0 && locationInfo.countSelected === 0) {
      // Only active - use muted but visible green
      fillColor = `rgb(180, ${Math.floor(205 + colorIntensity * 50)}, 180)`;
    } else if (locationInfo.countSelected > 0 && locationInfo.countActive === 0) {
      // Only selected - use muted but visible blue
      fillColor = `rgb(180, 190, ${Math.floor(210 + colorIntensity * 45)})`;
    } else if (locationInfo.countActive > 0 && locationInfo.countSelected > 0) {
      // Mixed - use muted but visible purple
      fillColor = `rgb(${Math.floor(190 + colorIntensity * 30)}, 170, ${Math.floor(200 + colorIntensity * 55)})`;
      dashArray = '3';
    }

    return {
      fillColor,
      weight: 1,
      opacity,
      color: '#c0c0c0', // Lighter border color
      fillOpacity,
      dashArray,
    };
  };

  // Tooltip content for each region
  const onEachFeature = (feature, layer) => {
    const locationName = feature.properties.shapeName;
    const locationInfo = locationLookup[locationName];
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
        <Box className={className} ref={mapContainerRef}>
          <div className={classes.mapContainer}>
            <Map
              className={classes.tiles}
              center={[-3.39, 29.90]} // Set the initial map center (latitude, longitude)
              zoom={8.3} // Set the initial zoom level
              style={{ height: mapDimensions.height, width: mapDimensions.width }}
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
          </div>
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
