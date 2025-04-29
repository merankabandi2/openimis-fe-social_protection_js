import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Grid,
  makeStyles,
  ThemeProvider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
} from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import { baseApiUrl, apiHeaders, decodeId } from '@openimis/fe-core';
import HomeIcon from '@material-ui/icons/Home';
import Person from '@material-ui/icons/Person';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ReceiptIcon from '@material-ui/icons/Receipt';
import PlaceIcon from '@material-ui/icons/Place';
import MapComponent from './MapComponent';
import BoxCard from './BoxCard';
import MonetaryTransferChart from './MonetaryTransferChart';
import MonetaryTransferChartBeneficiaires from './MonetaryTransferChartBeneficiaires';
import BenefitConsumptionByProvinces from './BenefitConsumptionByProvinces';

const buildFilter = (itemName, filters) => {
  const { locationId, benefitPlanId, year } = filters;

  // Helper function to create date range filters for a given year
  const createYearDateRange = (year, field = 'dateValidFrom') => {
    if (!year) return [];
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;
    return [
      `${field}_Lte: "${endDate}"`,
      `${field}_Gte: "${startDate}"`,
    ];
  };

  // Define which filters apply to which items and how they should be formatted
  const filterMap = {
    benefitsSummary: {
      year: (val) => `year: ${val}`,
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      benefitPlanId: (val) => `benefitPlanUuid: "${decodeId(val)}"`,
    },
    paymentCycle: {
      year: (val) => `year: ${val}`,
    },
    group: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      year: (val) => createYearDateRange(val, 'dateCreated'),
    },
    individual: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      year: (val) => createYearDateRange(val, 'dateCreated'),
    },
    groupBeneficiary: {
      locationId: (val) => `parentLocation: "${val}", parentLocationLevel: 0`,
      benefitPlanId: (val) => `benefitPlan_Id: "${decodeId(val)}"`,
      year: (val) => createYearDateRange(val),
    },
    locationByBenefitPlan: {
      benefitPlanId: (val) => `benefitPlan_Id: "${decodeId(val)}"`,
    },
  };

  // Get the filter config for this item
  const itemFilters = filterMap[itemName];
  if (!itemFilters) return '';

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

const loadStatsAll = async (filters = {}) => {
  const response = await fetch(`${baseApiUrl}/graphql`, {
    method: 'post',
    headers: apiHeaders(),
    body: JSON.stringify(
      {
        query: `
          {
            benefitsSummaryFiltered ${buildFilter('benefitsSummary', filters)} {
              totalAmountReceived,
              totalAmountDue
            },
            paymentCycleFiltered ${buildFilter('paymentCycle', filters)} {
              totalCount
            },
            groupFiltered ${buildFilter('group', filters)} {
              totalCount
            },
            individualFiltered ${buildFilter('individual', filters)} {
              totalCount
            },
            groupBeneficiaryFiltered ${buildFilter('groupBeneficiary', filters)} {
              totalCount
            },
            locationByBenefitPlan ${buildFilter('locationByBenefitPlan', filters)} {
              totalCount,
              edges {
                node {
                  id,
                  code,
                  name,
                  countSelected,
                  countSuspended,
                  countActive
                }
              }
            }
            ${filters.locationId ? '' : `
            locations (type: "D") {
              edges {
                node {
                  id,
                  uuid,
                  name,
                  code,
                  type
                }
              }
            }`}
            benefitPlan (isDeleted: false) {
              edges {
                node {
                  id,
                  name,
                  code
                }
              }
            }
          }
        `,
      },
    ),
  });
  if (!response.ok) {
    throw response;
  } else {
    const { data } = await response.json();
    return data;
  }
};

// Create a custom theme
const theme = createTheme({
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
    padding: theme.spacing(1),
  },
  box: {
    backgroundColor: '#fff',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
    height: '100%',
  },
  box1: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#5a8dee !important',
    },
  },
  box2: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#ff8f00 !important',
    },
  },
  box3: {
    color: '#8799a2',
    '& .apexcharts-series path': {
      stroke: '#00d0bd !important',
    },
  },
  chartContainer: {
    height: '350px',
  },
  filterContainer: {
    padding: theme.spacing(0),
    marginBottom: theme.spacing(1),
    backgroundColor: '#fff',
    boxShadow: '0 1px 20px 0 rgba(0,0,0,.1)',
  },
  filterFormControl: {
    margin: theme.spacing(1),
    minWidth: 100,
  },
  filterTitle: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: theme.spacing(1),
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
}));

// Dashboard component
function MonetaryTransfertDashboard() {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [filters, setFilters] = useState({
    locationId: '',
    benefitPlanId: '',
    year: '',
  });
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const loadFilteredData = () => {
    setIsLoading(true);
    loadStatsAll(filters)
      .then((data) => {
        setStats({ ...data });
        // Set location and benefit plan options if available
        if (data.locations && !locations.length) {
          setLocations(data.locations.edges.map(edge => edge.node)
            .filter(node => node.type === 'R' || node.type === 'D'));
        }
        if (data.benefitPlan && !benefitPlans.length) {
          setBenefitPlans(data.benefitPlan.edges.map(edge => edge.node));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load stats', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadFilteredData();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadFilteredData();
  };

  const handleResetFilters = () => {
    setFilters({
      locationId: '',
      benefitPlanId: '',
      year: '',
    });
    // Load with reset filters
    setTimeout(loadFilteredData, 0);
  };

  const classes = useStyles();

  const getStat = (item, field = 'totalCount') => (
    stats && stats[item] && stats[item][field] ? Number(stats[item][field])?.toLocaleString('fr-FR') : 0
  );

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.wrapper}>
        <Container maxWidth={false} className={classes.contentArea}>
          <div className="main">

            <Grid container spacing={2}>
              {/* Sparkboxes Row */}
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Bénéficiaires"
                  value={getStat('groupBeneficiaryFiltered')}
                  className={classes.box}
                  icon={<Person fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Paiements"
                  value={getStat('paymentCycleFiltered')}
                  className={classes.box}
                  icon={<ReceiptIcon fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <BoxCard
                  label="Montants"
                  value={`${getStat('benefitsSummaryFiltered', 'totalAmountDue')} BIF`}
                  className={classes.box}
                  valueVariant="h5"
                  icon={<AttachMoneyIcon fontSize="large" />}
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <MonetaryTransferChart filters={filters} />
              </Grid>
              <Grid item xs={12} md={4}>
                <MonetaryTransferChartBeneficiaires filters={filters} />
              </Grid>
              <Grid item xs={12} md={4}>
                <BenefitConsumptionByProvinces filters={filters} />
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    </ThemeProvider>
  );
}

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MonetaryTransfertDashboard);
