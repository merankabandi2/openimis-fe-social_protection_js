import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Box
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/styles';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { GetApp as ExportIcon, Refresh as RefreshIcon } from '@material-ui/icons';

import { useModulesManager, useTranslations, baseApiUrl, apiHeaders } from '@openimis/fe-core';

const useStyles = makeStyles((theme) => ({
  page: {
    padding: theme.spacing(2),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  chartContainer: {
    height: 300,
    width: '100%',
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  statLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  exportButton: {
    margin: theme.spacing(1),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
}));

// Color schemes for charts
const GENDER_COLORS = ['#4285F4', '#EA4335']; // Blue for men, Red for women
const MINORITY_COLORS = ['#9C27B0', '#E0E0E0']; // Purple for Twa, Gray for Non-Twa
const COMMUNITY_COLORS = ['#FFD93D', '#6BCF7F'];

function MEDashboard({ rights, locations }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    locationId: '',
    year: new Date().getFullYear(),
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.locationId) params.append('location_id', filters.locationId);

      const [summaryResponse, beneficiaryResponse, refugeeHostResponse, quarterlyResponse, twaResponse] = await Promise.all([
        fetch(`${baseApiUrl}/merankabandi/dashboard/summary/?${params}`, {
          headers: apiHeaders,
        }),
        fetch(`${baseApiUrl}/merankabandi/dashboard/beneficiary-breakdown/?${params}`, {
          headers: apiHeaders,
        }),
        fetch(`${baseApiUrl}/merankabandi/dashboard/refugee-host-breakdown/?${params}`, {
          headers: apiHeaders,
        }),
        fetch(`${baseApiUrl}/merankabandi/dashboard/quarterly-rollup/?year=${filters.year}`, {
          headers: apiHeaders,
        }),
        fetch(`${baseApiUrl}/merankabandi/dashboard/twa-metrics/?${params}`, {
          headers: apiHeaders,
        }),
      ]);

      const summaryData = await summaryResponse.json();
      const beneficiaryData = await beneficiaryResponse.json();
      const refugeeHostData = await refugeeHostResponse.json();
      const quarterlyData = await quarterlyResponse.json();
      const twaData = await twaResponse.json();

      if (summaryData.success && beneficiaryData.success && refugeeHostData.success && quarterlyData.success && twaData.success) {
        setDashboardData({
          summary: summaryData.data,
          beneficiaryBreakdown: beneficiaryData.data,
          refugeeHostBreakdown: refugeeHostData.data,
          quarterlyData: quarterlyData.data,
          twaData: twaData.data,
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExport = async (reportType) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.locationId) params.append('location_id', filters.locationId);

      const response = await fetch(`${baseApiUrl}/merankabandi/export/excel/${reportType}/?${params}`, {
        headers: apiHeaders,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  };

  // Auto-aggregate indicators
  const handleAutoAggregate = async (type) => {
    try {
      const response = await fetch(`${baseApiUrl}/merankabandi/indicators/auto-aggregate/`, {
        method: 'POST',
        headers: {
          ...apiHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          year: filters.year,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Auto-aggregation successful: ${data.message}`);
        fetchDashboardData(); // Refresh data
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(`Auto-aggregation failed: ${err.message}`);
    }
  };

  // Load data on component mount and filter change
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  // Prepare chart data
  const getGenderChartData = () => {
    if (!dashboardData?.beneficiaryBreakdown?.gender_summary) return [];
    
    const { planned } = dashboardData.beneficiaryBreakdown.gender_summary;
    // Only show gender breakdown (men vs women)
    return [
      { name: 'Hommes', value: planned.men || 0 },
      { name: 'Femmes', value: planned.women || 0 },
    ].filter(item => item.value > 0);
  };

  const getMinorityGroupData = () => {
    if (!dashboardData?.beneficiaryBreakdown?.gender_summary) return [];
    
    const { planned } = dashboardData.beneficiaryBreakdown.gender_summary;
    const totalNonTwa = (planned.men || 0) + (planned.women || 0);
    const twaValue = planned.twa || 0;
    
    return [
      { name: 'Twa', value: twaValue },
      { name: 'Non-Twa', value: totalNonTwa },
    ].filter(item => item.value > 0);
  };

  const getCommunityChartData = () => {
    if (!dashboardData?.refugeeHostBreakdown) return [];
    
    const { host_community, refugee_community } = dashboardData.refugeeHostBreakdown;
    return [
      { name: 'Communautés d\'accueil', value: host_community?.planned_beneficiaries || 0 },
      { name: 'Réfugiés', value: refugee_community?.planned_beneficiaries || 0 },
    ].filter(item => item.value > 0);
  };

  const getQuarterlyChartData = () => {
    if (!dashboardData?.quarterlyData) return [];
    
    return Object.entries(dashboardData.quarterlyData).map(([quarter, data]) => ({
      quarter,
      transfers: data.transfers?.total_paid || 0,
      training: data.training?.total_participants || 0,
      microProjects: data.micro_projects?.total_beneficiaries || 0,
    }));
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.page}>
      {/* Filters */}
      <Paper className={classes.filterContainer}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <TextField
              label="Date de début"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Date de fin"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Localisation</InputLabel>
              <Select
                value={filters.locationId}
                onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
              >
                <MenuItem value="">Toutes</MenuItem>
                {locations?.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label="Année"
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={fetchDashboardData}
              startIcon={<RefreshIcon />}
              className={classes.exportButton}
            >
              Actualiser
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleExport('monetary_transfers')}
              startIcon={<ExportIcon />}
              className={classes.exportButton}
            >
              Export Transferts
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleAutoAggregate('household_registration')}
              className={classes.exportButton}
            >
              Auto-Agrégation
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" style={{ marginBottom: 16 }}>
          {error}
        </Alert>
      )}

      {dashboardData && (
        <Grid container spacing={3}>
          {/* Summary Statistics */}
          <Grid item xs={12} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography className={classes.statValue}>
                  {dashboardData.summary?.overview?.total_planned_beneficiaries?.toLocaleString() || 0}
                </Typography>
                <Typography className={classes.statLabel}>
                  Bénéficiaires Prévus
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography className={classes.statValue}>
                  {dashboardData.summary?.overview?.female_percentage || 0}%
                </Typography>
                <Typography className={classes.statLabel}>
                  Pourcentage Femmes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography className={classes.statValue}>
                  {dashboardData.summary?.overview?.twa_inclusion_rate || 0}%
                </Typography>
                <Typography className={classes.statLabel}>
                  Inclusion Twa
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card className={classes.statCard}>
              <CardContent>
                <Typography className={classes.statValue}>
                  {dashboardData.summary?.overview?.host_community_percentage || 0}%
                </Typography>
                <Typography className={classes.statLabel}>
                  Communautés d'Accueil
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gender Breakdown Chart */}
          <Grid item xs={12} md={4}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" gutterBottom>
                  Répartition par Genre
                </Typography>
                <div className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getGenderChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getGenderChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Minority Group Chart */}
          <Grid item xs={12} md={4}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" gutterBottom>
                  Inclusion Minorité Twa
                </Typography>
                <div className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getMinorityGroupData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getMinorityGroupData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MINORITY_COLORS[index % MINORITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Community Type Chart */}
          <Grid item xs={12} md={4}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" gutterBottom>
                  Réfugiés vs Communautés d'Accueil
                </Typography>
                <div className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCommunityChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCommunityChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COMMUNITY_COLORS[index % COMMUNITY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Quarterly Trends */}
          <Grid item xs={12}>
            <Card className={classes.card}>
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" gutterBottom>
                  Tendances Trimestrielles {filters.year}
                </Typography>
                <div className={classes.chartContainer}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getQuarterlyChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transfers" fill="#FF6B6B" name="Transferts" />
                      <Bar dataKey="training" fill="#4ECDC4" name="Formations" />
                      <Bar dataKey="microProjects" fill="#45B7D1" name="Micro-projets" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Export Buttons */}
          <Grid item xs={12}>
            <Paper style={{ padding: 16 }}>
              <Typography variant="h6" gutterBottom>
                Exports Excel
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  onClick={() => handleExport('monetary_transfers')}
                  startIcon={<ExportIcon />}
                  className={classes.exportButton}
                >
                  Transferts Monétaires
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleExport('accompanying_measures')}
                  startIcon={<ExportIcon />}
                  className={classes.exportButton}
                >
                  Mesures d'Accompagnement
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleExport('microprojects')}
                  startIcon={<ExportIcon />}
                  className={classes.exportButton}
                >
                  Micro-projets
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </div>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  locations: state.location?.locations ?? [],
});

export default connect(mapStateToProps)(MEDashboard);