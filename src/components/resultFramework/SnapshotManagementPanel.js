import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  Paper,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  CircularProgress,
} from '@material-ui/core';
import {
  Add as AddIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
} from '@material-ui/icons';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  formatMessage,
  formatDateFromISO,
  formatDateTimeFromISO,
  useModulesManager,
  Searcher,
  journalize,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchResultFrameworkSnapshots,
  createResultFrameworkSnapshot,
  generateResultFrameworkDocument,
  finalizeSnapshot,
  clearResultFrameworkSnapshots,
} from '../../actions/resultFramework';

const styles = (theme) => ({
  paper: theme.paper.paper,
  paperHeader: theme.paper.header,
  tableTitle: theme.table.title,
  fab: theme.fab,
  item: theme.paper.item,
  successChip: {
    backgroundColor: theme.palette.success.main,
    color: 'white',
  },
  warningChip: {
    backgroundColor: theme.palette.warning.main,
    color: 'white',
  },
  errorChip: {
    backgroundColor: theme.palette.error.main,
    color: 'white',
  },
});

const SNAPSHOT_FILTERS = ['name_Icontains', 'status'];

function SnapshotManagementPanel({
  intl,
  classes,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  // Actions
  fetchResultFrameworkSnapshots,
  createResultFrameworkSnapshot,
  generateResultFrameworkDocument,
  finalizeSnapshot,
  clearResultFrameworkSnapshots,
  journalize,
  coreConfirm,
  clearConfirm,
  // Data
  snapshots,
  snapshotsPageInfo,
  fetchingSnapshots,
}) {
  const modulesManager = useModulesManager();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSnapshot, setNewSnapshot] = useState({
    name: '',
    description: '',
    dateFrom: null,
    dateTo: null,
  });
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [generatingDocument, setGeneratingDocument] = useState(false);

  useEffect(() => {
    if (confirmed) {
      finalizeSnapshot(confirmed.snapshotId);
      clearConfirm();
    }
  }, [confirmed]);

  const headers = () => [
    'socialProtection.resultFramework.snapshot.name',
    'socialProtection.resultFramework.snapshot.createdDate',
    'socialProtection.resultFramework.snapshot.createdBy',
    'socialProtection.resultFramework.snapshot.status',
    '',
  ];

  const itemFormatters = () => [
    (snapshot) => snapshot.name,
    (snapshot) => formatDateTimeFromISO(modulesManager, intl, snapshot.snapshotDate),
    (snapshot) => snapshot.createdBy?.username || '-',
    (snapshot) => (
      <Chip
        label={formatMessage(intl, 'socialProtection', `snapshot.status.${snapshot.status}`)}
        className={
          snapshot.status === 'FINALIZED' ? classes.successChip :
          snapshot.status === 'DRAFT' ? classes.warningChip :
          classes.errorChip
        }
        size="small"
      />
    ),
    (snapshot) => (
      <div style={{ textAlign: 'right' }}>
        <Tooltip title={formatMessage(intl, 'socialProtection', 'snapshot.view')}>
          <IconButton size="small" onClick={() => handleViewSnapshot(snapshot)}>
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage(intl, 'socialProtection', 'snapshot.generateDocument')}>
          <IconButton 
            size="small" 
            onClick={() => handleGenerateDocument(snapshot)}
            disabled={generatingDocument}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {snapshot.status === 'DRAFT' && (
          <Tooltip title={formatMessage(intl, 'socialProtection', 'snapshot.finalize')}>
            <IconButton size="small" onClick={() => handleFinalizeSnapshot(snapshot)}>
              <LockIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  const handleCreateSnapshot = () => {
    createResultFrameworkSnapshot(
      newSnapshot.name,
      newSnapshot.description,
      newSnapshot.dateFrom,
      newSnapshot.dateTo
    );
    setCreateDialogOpen(false);
    setNewSnapshot({ name: '', description: '', dateFrom: null, dateTo: null });
    // Refresh list
    setTimeout(() => fetchResultFrameworkSnapshots({ first: 10 }), 1000);
  };

  const handleViewSnapshot = (snapshot) => {
    setSelectedSnapshot(snapshot);
    setViewDialogOpen(true);
  };

  const handleGenerateDocument = async (snapshot) => {
    setGeneratingDocument(true);
    try {
      const response = await generateResultFrameworkDocument(snapshot.id, 'docx');
      if (response?.payload?.data?.generateResultFrameworkDocument?.documentUrl) {
        // In a real implementation, this would download the file
        window.open(response.payload.data.generateResultFrameworkDocument.documentUrl, '_blank');
      }
      journalize(mutation);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setGeneratingDocument(false);
    }
  };

  const handleFinalizeSnapshot = (snapshot) => {
    coreConfirm(
      formatMessage(intl, 'socialProtection', 'snapshot.finalize.confirm.title'),
      formatMessage(intl, 'socialProtection', 'snapshot.finalize.confirm.message'),
      () => ({ snapshotId: snapshot.id })
    );
  };

  const rowIdentifier = (snapshot) => snapshot.id;

  const defaultFilters = () => ({
    isDeleted: {
      value: false,
      filter: 'exact',
    },
  });

  return (
    <>
      <Paper className={classes.paper}>
        <Grid container className={classes.paperHeader}>
          <Grid item xs={8}>
            <Typography variant="h6">
              {formatMessage(intl, 'socialProtection', 'resultFramework.snapshots.title')}
            </Typography>
          </Grid>
          <Grid item xs={4} style={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              className={classes.fab}
            >
              {formatMessage(intl, 'socialProtection', 'snapshot.create.button')}
            </Button>
          </Grid>
        </Grid>
        <Searcher
          module="socialProtection"
          FilterPane={null}
          fetch={fetchResultFrameworkSnapshots}
          items={snapshots}
          itemsPageInfo={snapshotsPageInfo}
          fetchingItems={fetchingSnapshots}
          fetchedItems={snapshots?.length || 0}
          tableTitle={formatMessage(intl, 'socialProtection', 'resultFramework.snapshots.list')}
          headers={headers}
          itemFormatters={itemFormatters}
          rowsPerPageOptions={[5, 10, 20]}
          defaultPageSize={10}
          rowIdentifier={rowIdentifier}
          defaultOrderBy="snapshotDate"
          defaultFilters={defaultFilters}
          filterPaneDialogFilters={SNAPSHOT_FILTERS}
        />
      </Paper>

      {/* Create Snapshot Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {formatMessage(intl, 'socialProtection', 'snapshot.create.title')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={formatMessage(intl, 'socialProtection', 'snapshot.name')}
                value={newSnapshot.name}
                onChange={(e) => setNewSnapshot({ ...newSnapshot, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={formatMessage(intl, 'socialProtection', 'snapshot.description')}
                value={newSnapshot.description}
                onChange={(e) => setNewSnapshot({ ...newSnapshot, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage(intl, 'socialProtection', 'snapshot.dateFrom')}
                type="date"
                value={newSnapshot.dateFrom || ''}
                onChange={(e) => setNewSnapshot({ ...newSnapshot, dateFrom: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={formatMessage(intl, 'socialProtection', 'snapshot.dateTo')}
                type="date"
                value={newSnapshot.dateTo || ''}
                onChange={(e) => setNewSnapshot({ ...newSnapshot, dateTo: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            {formatMessage(intl, 'socialProtection', 'dialog.cancel')}
          </Button>
          <Button 
            onClick={handleCreateSnapshot} 
            color="primary"
            disabled={!newSnapshot.name || submittingMutation}
          >
            {formatMessage(intl, 'socialProtection', 'dialog.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Snapshot Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedSnapshot?.name} - {formatMessage(intl, 'socialProtection', 'snapshot.details')}
        </DialogTitle>
        <DialogContent>
          {selectedSnapshot && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  {formatMessage(intl, 'socialProtection', 'snapshot.createdDate')}: {formatDateTimeFromISO(modulesManager, intl, selectedSnapshot.snapshotDate)}
                </Typography>
                {selectedSnapshot.description && (
                  <Typography variant="body1" style={{ marginTop: 8 }}>
                    {selectedSnapshot.description}
                  </Typography>
                )}
              </Grid>
              {selectedSnapshot.data?.sections?.map((section, idx) => (
                <Grid item xs={12} key={idx}>
                  <Typography variant="h6" style={{ marginTop: 16 }}>
                    {section.name}
                  </Typography>
                  <Grid container spacing={1}>
                    {section.indicators?.map((indicator, iIdx) => (
                      <Grid item xs={12} key={iIdx}>
                        <Paper style={{ padding: 8, marginTop: 4 }}>
                          <Grid container alignItems="center">
                            <Grid item xs={6}>
                              <Typography variant="body2">{indicator.name}</Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography variant="body2" align="right">
                                {indicator.achieved} / {indicator.target}
                              </Typography>
                            </Grid>
                            <Grid item xs={3}>
                              <Typography 
                                variant="body2" 
                                align="right"
                                style={{ 
                                  color: indicator.percentage >= 80 ? 'green' : 
                                         indicator.percentage >= 50 ? 'orange' : 'red' 
                                }}
                              >
                                {indicator.percentage.toFixed(1)}%
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            {formatMessage(intl, 'socialProtection', 'dialog.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {generatingDocument && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress />
        </div>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
  fetchingSnapshots: state.socialProtection.fetchingResultFrameworkSnapshots,
  snapshots: state.socialProtection.resultFrameworkSnapshots,
  snapshotsPageInfo: state.socialProtection.resultFrameworkSnapshotsPageInfo,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchResultFrameworkSnapshots,
  createResultFrameworkSnapshot,
  generateResultFrameworkDocument,
  finalizeSnapshot,
  clearResultFrameworkSnapshots,
  journalize,
  coreConfirm,
  clearConfirm,
}, dispatch);

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    withTheme(withStyles(styles)(SnapshotManagementPanel))
  )
);