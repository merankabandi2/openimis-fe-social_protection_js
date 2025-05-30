import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import {
  useTranslations,
  useModulesManager,
  useGraphqlMutation,
  useGraphqlQuery,
  formatDateFromISO,
  formatMessage,
  ProgressOrError,
} from '@openimis/fe-core';
import { RIGHT_KOBO_ETL_RUN } from '../constants';
import SyncIcon from '@material-ui/icons/Sync';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

const useStyles = makeStyles((theme) => ({
  page: {
    margin: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  syncButton: {
    marginTop: theme.spacing(2),
  },
  statusSection: {
    marginTop: theme.spacing(3),
  },
  statusChip: {
    margin: theme.spacing(0.5),
  },
  historyTable: {
    marginTop: theme.spacing(2),
  },
}));

const KOBO_ETL_STATUS_QUERY = `
  query KoboETLStatus {
    koboEtlStatus {
      isConfigured
      hasToken
      availableScopes
      lastSyncDate
    }
  }
`;

const RUN_KOBO_ETL_MUTATION = `
  mutation RunKoboETL($input: KoboETLInput!) {
    runKoboEtl(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

const MUTATION_STATUS_QUERY = `
  query MutationStatus($mutationId: String!) {
    mutationLogs(clientMutationId: $mutationId) {
      edges {
        node {
          id
          status
          error
          clientMutationId
          clientMutationLabel
          clientMutationDetails
          requestDateTime
          jsonExt
        }
      }
    }
  }
`;

function KoboETLAdminPage() {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);
  
  const [selectedScope, setSelectedScope] = useState('all');
  const [mutationStatus, setMutationStatus] = useState(null);
  const [recentMutations, setRecentMutations] = useState([]);

  // Query ETL status
  const { data: statusData, loading: statusLoading, error: statusError, refetch: refetchStatus } = useGraphqlQuery(
    KOBO_ETL_STATUS_QUERY,
    {},
    { skip: false }
  );

  // Setup mutation with async handling
  const { mutate: runETL, loading: mutationLoading } = useGraphqlMutation(
    RUN_KOBO_ETL_MUTATION,
    {
      onCompleted: (data) => {
        if (data?.runKoboEtl?.clientMutationId) {
          // Start polling for mutation status
          pollMutationStatus(data.runKoboEtl.clientMutationId);
        }
      },
      onError: (error) => {
        setMutationStatus({
          status: 'error',
          message: error.message || formatMessage('koboETL.error.mutationFailed'),
        });
      },
    }
  );

  // Poll mutation status
  const pollMutationStatus = async (mutationId) => {
    setMutationStatus({
      status: 'running',
      message: formatMessage('koboETL.status.processing'),
    });

    const checkStatus = async () => {
      try {
        const result = await modulesManager.getRef('core.graphqlWithVariables')(
          MUTATION_STATUS_QUERY,
          { mutationId }
        );

        const mutation = result?.data?.mutationLogs?.edges?.[0]?.node;
        
        if (mutation) {
          if (mutation.status === 1) { // SUCCESS
            setMutationStatus({
              status: 'success',
              message: formatMessage('koboETL.status.completed'),
            });
            refetchStatus();
            fetchRecentMutations();
          } else if (mutation.status === 2) { // ERROR
            setMutationStatus({
              status: 'error',
              message: mutation.error || formatMessage('koboETL.error.syncFailed'),
            });
          } else { // PENDING
            // Continue polling
            setTimeout(checkStatus, 2000);
          }
        }
      } catch (error) {
        setMutationStatus({
          status: 'error',
          message: formatMessage('koboETL.error.statusCheckFailed'),
        });
      }
    };

    checkStatus();
  };

  // Fetch recent mutation history
  const fetchRecentMutations = async () => {
    try {
      const result = await modulesManager.getRef('core.graphqlWithVariables')(
        `query RecentKoboETLMutations {
          mutationLogs(
            mutationModule: "kobo_etl"
            mutationClass: "RunKoboETLMutation"
            orderBy: "-requestDateTime"
            first: 10
          ) {
            edges {
              node {
                id
                status
                error
                clientMutationLabel
                requestDateTime
                jsonExt
              }
            }
          }
        }`,
        {}
      );

      setRecentMutations(result?.data?.mutationLogs?.edges?.map(e => e.node) || []);
    } catch (error) {
      console.error('Failed to fetch mutation history:', error);
    }
  };

  useEffect(() => {
    fetchRecentMutations();
  }, []);

  const handleRunETL = () => {
    setMutationStatus(null);
    runETL({
      variables: {
        input: {
          scope: selectedScope,
        },
      },
    });
  };

  if (statusLoading) return <ProgressOrError progress={statusLoading} />;
  if (statusError) return <ProgressOrError error={statusError} />;

  const etlStatus = statusData?.koboEtlStatus;

  return (
    <div className={classes.page}>
      <Typography variant="h4" className={classes.header}>
        {formatMessage('koboETL.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={formatMessage('koboETL.configurationStatus')} />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    icon={etlStatus?.isConfigured ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={formatMessage(etlStatus?.isConfigured ? 'koboETL.configured' : 'koboETL.notConfigured')}
                    color={etlStatus?.isConfigured ? 'primary' : 'default'}
                    className={classes.statusChip}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    icon={etlStatus?.hasToken ? <CheckCircleIcon /> : <ErrorIcon />}
                    label={formatMessage(etlStatus?.hasToken ? 'koboETL.tokenPresent' : 'koboETL.tokenMissing')}
                    color={etlStatus?.hasToken ? 'primary' : 'default'}
                    className={classes.statusChip}
                  />
                </Box>
                {etlStatus?.lastSyncDate && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon />
                    <Typography variant="body2">
                      {formatMessage('koboETL.lastSync')}: {formatDateFromISO(etlStatus.lastSyncDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ETL Control */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title={formatMessage('koboETL.runETL')} />
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>{formatMessage('koboETL.scope')}</InputLabel>
                <Select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value)}
                  disabled={mutationLoading || !etlStatus?.hasToken}
                >
                  {etlStatus?.availableScopes?.map((scope) => (
                    <MenuItem key={scope} value={scope}>
                      {formatMessage(`koboETL.scope.${scope}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                startIcon={mutationLoading ? <CircularProgress size={20} /> : <SyncIcon />}
                onClick={handleRunETL}
                disabled={mutationLoading || !etlStatus?.hasToken}
                className={classes.syncButton}
                fullWidth
              >
                {mutationLoading ? formatMessage('koboETL.syncing') : formatMessage('koboETL.sync')}
              </Button>

              {mutationStatus && (
                <Box mt={2}>
                  <Alert severity={mutationStatus.status === 'error' ? 'error' : mutationStatus.status === 'success' ? 'success' : 'info'}>
                    {mutationStatus.message}
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sync History */}
        <Grid item xs={12}>
          <Card className={classes.statusSection}>
            <CardHeader title={formatMessage('koboETL.recentHistory')} />
            <CardContent>
              <TableContainer component={Paper} className={classes.historyTable}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{formatMessage('koboETL.history.date')}</TableCell>
                      <TableCell>{formatMessage('koboETL.history.scope')}</TableCell>
                      <TableCell>{formatMessage('koboETL.history.status')}</TableCell>
                      <TableCell>{formatMessage('koboETL.history.error')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentMutations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          {formatMessage('koboETL.history.noRecords')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentMutations.map((mutation) => (
                        <TableRow key={mutation.id}>
                          <TableCell>{formatDateFromISO(mutation.requestDateTime)}</TableCell>
                          <TableCell>
                            {mutation.jsonExt?.scope || mutation.clientMutationLabel || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              icon={mutation.status === 1 ? <CheckCircleIcon /> : mutation.status === 2 ? <ErrorIcon /> : <AccessTimeIcon />}
                              label={formatMessage(`koboETL.status.${mutation.status === 1 ? 'success' : mutation.status === 2 ? 'error' : 'pending'}`)}
                              color={mutation.status === 1 ? 'primary' : mutation.status === 2 ? 'secondary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{mutation.error || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default KoboETLAdminPage;