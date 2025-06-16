import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  makeStyles, 
  CircularProgress, 
  Typography,
  Paper,
  Chip,
  Fade,
} from '@material-ui/core';
import {
  Map, TileLayer, GeoJSON, Tooltip as LeafletTooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import L from 'leaflet';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import GroupIcon from '@material-ui/icons/Group';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

// This is needed to fix Leaflet icon issues in React

const REQUESTED_WITH = 'webapp';

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    width: '100%',
    height: '100%',
    minHeight: '650px',
    position: 'relative',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
  },
  tiles: {
    '& img.leaflet-tile.leaflet-tile-loaded': {
      filter: 'grayscale(0.8) brightness(1.1)',
    },
  },
  legendContainer: {
    position: 'absolute',
    bottom: theme.spacing(8),
    right: theme.spacing(1),
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(4px)',
  },
  legendTitle: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    fontSize: '0.875rem',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: theme.spacing(1),
    border: '1px solid rgba(0,0,0,0.1)',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(4px)',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '650px',
    flexDirection: 'column',
  },
}));

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const loadStats = async (filters = {}) => {
  const csrfToken = localStorage.getItem('csrfToken');
  const baseHeaders = apiHeaders();
  
  // Build filter object for optimized query
  const queryFilters = {};
  if (filters.benefitPlan) {
    queryFilters.benefitPlanId = decodeId(filters.benefitPlan);
  }
  if (filters.year) {
    queryFilters.year = filters.year;
  }
  // Handle hierarchical location filters
  if (filters.provinces && filters.provinces.length > 0) {
    queryFilters.provinceId = parseInt(decodeId(filters.provinces[0]));
  }
  if (filters.communes && filters.communes.length > 0) {
    queryFilters.communeId = parseInt(decodeId(filters.communes[0]));
  }
  if (filters.collines && filters.collines.length > 0) {
    queryFilters.collineId = parseInt(decodeId(filters.collines[0]));
  }
  
  const query = `
    query OptimizedLocationByBenefitPlan($filters: DashboardFiltersInput) {
      optimizedLocationByBenefitPlan(filters: $filters) {
        id
        code
        name
        countSelected
        countSuspended
        countActive
        countPotential
        countValidated
        countGraduated
      }
    }
  `;
  
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: { ...baseHeaders, 'X-Requested-With': REQUESTED_WITH, 'X-CSRFToken': csrfToken },
    body: JSON.stringify({ 
      query,
      variables: { filters: queryFilters }
    }),
  });
  
  if (!response.ok) {
    throw response;
  } else {
    const { data } = await response.json();
    return data;
  }
};

function MapComponent({ filters, isLoading: parentLoading, fullMap = false }) {
  const classes = useStyles();
  const mapContainerRef = useRef(null);
  const [burundiGeoJSON, setBurundiGeoJSON] = useState(null);
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [locationLookup, setLocationLookup] = useState({});

  // Load GeoJSON
  useEffect(() => {
    fetch('/front/maps/provinces.geojson')
      .then((response) => response.json())
      .then((data) => setBurundiGeoJSON(data))
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, []);

  // Load location data
  useEffect(() => {
    setLoading(true);
    loadStats(filters)
      .then((data) => {
        const locations = data.optimizedLocationByBenefitPlan || [];
        setLocationData(locations);
        const lookup = {};
        locations.forEach((loc) => {
          lookup[loc.name] = loc;
        });
        setLocationLookup(lookup);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load stats', error);
        setError('Failed to load data');
        setLoading(false);
      });
  }, [filters]);

  // Calculate total count for a location
  const getTotalCount = (location) => {
    return (location.countPotential || 0) + 
           (location.countValidated || 0) + 
           (location.countActive || 0) + 
           (location.countGraduated || 0) + 
           (location.countSuspended || 0);
  };

  // Find the max count for color scaling
  const maxCount = locationData.length
    ? Math.max(...locationData.map(getTotalCount)) : 0;

  // Enhanced style function with better colors
  const getStyle = (feature, isHovered = false) => {
    const locationName = feature.properties.shapeName;
    const locationInfo = locationLookup[locationName];

    if (!locationInfo) {
      return {
        fillColor: '#e8eaf6',
        weight: isHovered ? 2 : 1,
        opacity: 1,
        color: isHovered ? '#5a8dee' : '#90a4ae',
        fillOpacity: 0.5,
        transition: 'all 0.3s ease',
      };
    }

    const totalCount = getTotalCount(locationInfo);
    const colorIntensity = Math.min(1, totalCount / maxCount);

    // Enhanced color scheme
    let fillColor = '#e8eaf6';
    let borderColor = '#90a4ae';
    const baseOpacity = 0.7;
    const fillOpacity = baseOpacity + (colorIntensity * 0.2);

    // Determine color based on dominant status
    const statusCounts = {
      potential: locationInfo.countPotential || 0,
      validated: locationInfo.countValidated || 0,
      active: locationInfo.countActive || 0,
      graduated: locationInfo.countGraduated || 0,
      suspended: locationInfo.countSuspended || 0
    };
    
    // Find dominant status
    const dominantStatus = Object.keys(statusCounts).reduce((a, b) => 
      statusCounts[a] > statusCounts[b] ? a : b
    );
    
    const intensity = Math.floor(colorIntensity * 100);
    
    switch(dominantStatus) {
      case 'potential':
        fillColor = `hsl(0, 0%, ${85 - intensity * 0.3}%)`;  // Gray
        borderColor = '#9e9e9e';
        break;
      case 'validated':
        fillColor = `hsl(210, ${40 + intensity}%, ${85 - intensity * 0.3}%)`;  // Blue
        borderColor = '#1565c0';
        break;
      case 'active':
        fillColor = `hsl(120, ${40 + intensity}%, ${85 - intensity * 0.3}%)`;  // Green
        borderColor = '#2e7d32';
        break;
      case 'graduated':
        fillColor = `hsl(30, ${40 + intensity}%, ${85 - intensity * 0.3}%)`;  // Orange
        borderColor = '#ff9800';
        break;
      case 'suspended':
        fillColor = `hsl(0, ${40 + intensity}%, ${85 - intensity * 0.3}%)`;  // Red
        borderColor = '#f44336';
        break;
    }

    return {
      fillColor,
      weight: isHovered ? 3 : 1.5,
      opacity: 1,
      color: isHovered ? borderColor : borderColor,
      fillOpacity: isHovered ? fillOpacity + 0.1 : fillOpacity,
      transition: 'all 0.3s ease',
    };
  };

  // Enhanced interaction handlers
  const onEachFeature = (feature, layer) => {
    const locationName = feature.properties.shapeName;
    const locationInfo = locationLookup[locationName];
    
    layer.on({
      mouseover: (e) => {
        setHoveredProvince(locationName);
        e.target.setStyle(getStyle(feature, true));
        e.target.bringToFront();
      },
      mouseout: (e) => {
        setHoveredProvince(null);
        e.target.setStyle(getStyle(feature, false));
      },
    });
    
    if (locationInfo) {
      layer.bindTooltip(`
        <div style="
          min-width: 250px;
          font-family: 'Titillium Web', sans-serif;
          padding: 8px;
          line-height: 1.5;
        ">
          <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1a237e;">
            ${locationInfo.name}
          </div>
          ${locationInfo.countPotential > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #546e7a;">Potentiels:</span>
            <span style="font-weight: 600; color: #9e9e9e;">${(locationInfo.countPotential || 0).toLocaleString('fr-FR')}</span>
          </div>` : ''}
          ${locationInfo.countValidated > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #546e7a;">Validés:</span>
            <span style="font-weight: 600; color: #1565c0;">${(locationInfo.countValidated || 0).toLocaleString('fr-FR')}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #546e7a;">Actifs:</span>
            <span style="font-weight: 600; color: #2e7d32;">${(locationInfo.countActive || 0).toLocaleString('fr-FR')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span style="color: #546e7a;">Suspendus:</span>
            <span style="font-weight: 600; color: #f44336;">${(locationInfo.countSuspended || 0).toLocaleString('fr-FR')}</span>
          </div>
          <div style="
            border-top: 1px solid #e0e0e0;
            margin-top: 8px;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
          ">
            <span style="font-weight: 600; color: #37474f;">Total:</span>
            <span style="font-weight: 600; color: #1a237e; font-size: 16px;">
              ${getTotalCount(locationInfo).toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      `, {
        sticky: false,
        direction: 'auto',
        className: 'custom-tooltip',
      });
    }
  };

  // Calculate statistics
  const totalBeneficiaries = locationData.reduce((sum, loc) => sum + getTotalCount(loc), 0);
  const activeProvinces = locationData.filter(loc => getTotalCount(loc) > 0).length;
  
  if (loading || parentLoading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={60} color="primary" />
        <Typography style={{ marginTop: 16 }} color="textSecondary">
          Chargement de la carte...
        </Typography>
      </Box>
    );
  }

  return (
    <Box ref={mapContainerRef} style={{ position: 'relative', height: '100%' }}>
      <div className={classes.mapContainer}>
        <Map
          className={classes.tiles}
          center={[-3.39, 29.90]}
          zoom={fullMap ? 8 : 8.3}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
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
        
        {/* Legend */}
        <Fade in={!loading}>
          <Paper className={classes.legendContainer}>
            <Typography className={classes.legendTitle}>
              <LocationOnIcon fontSize="small" style={{ marginRight: 4 }} />
              Légende
            </Typography>
            <div className={classes.legendItem}>
              <div className={classes.legendColor} style={{ backgroundColor: 'hsl(0, 0%, 70%)' }} />
              <span>Potentiels</span>
            </div>
            <div className={classes.legendItem}>
              <div className={classes.legendColor} style={{ backgroundColor: 'hsl(210, 80%, 70%)' }} />
              <span>Validés</span>
            </div>
            <div className={classes.legendItem}>
              <div className={classes.legendColor} style={{ backgroundColor: 'hsl(120, 80%, 70%)' }} />
              <span>Actifs</span>
            </div>
            <div className={classes.legendItem}>
              <div className={classes.legendColor} style={{ backgroundColor: 'hsl(0, 80%, 70%)' }} />
              <span>Suspendus</span>
            </div>
          </Paper>
        </Fade>
        
        {/* Stats Overlay */}
        <Fade in={!loading}>
          <Paper className={classes.statsOverlay}>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                icon={<GroupIcon />}
                label={`${totalBeneficiaries.toLocaleString('fr-FR')} bénéficiaires`}
                color="primary"
                size="small"
              />
              <Chip
                icon={<CheckCircleIcon />}
                label={`${activeProvinces} provinces actives`}
                color="secondary"
                size="small"
              />
            </Box>
          </Paper>
        </Fade>
      </div>
    </Box>
  );
}

export default MapComponent;
