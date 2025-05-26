import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { IconButton, Tooltip, Chip, Box, Typography, Paper } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  baseApiUrl,
  apiHeaders,
  downloadExport,
} from '@openimis/fe-core';
import { deleteSensitizationTraining, fetchSensitizationTrainings } from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  SENSITIZATION_TRAINING_ROUTE,
  RIGHT_SENSITIZATION_TRAINING_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import { mutationLabel, pageTitle } from '../../util/string-utils';
import SensitizationTrainingFilter from './SensitizationTrainingFilter';
import ValidationDialog from '../dialogs/ValidationDialog';

function SensitizationTrainingSearcher({
  fetchSensitizationTrainings,
  fetchingSensitizationTrainings,
  fetchedSensitizationTrainings,
  errorSensitizationTrainings,
  deleteSensitizationTraining,
  sensitizationTrainings,
  coreConfirm,
  clearConfirm,
  pageInfo,
  totalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);
  const intl = useIntl();

  const [sensitizationTrainingToDelete, setSensitizationTrainingToDelete] = useState(null);
  const [deletedSensitizationTrainingUuids, setDeletedSensitizationTrainingUuids] = useState([]);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const prevSubmittingMutationRef = useRef();

  // Helper function to get category display label
  const getCategoryLabel = (categoryKey) => {
    if (!categoryKey) return '';
    
    // Try to get translation first - handle both lowercase and uppercase keys
    const normalizedKey = categoryKey.toLowerCase();
    const translationKey = `sensitizationTraining.category.${normalizedKey}`;
    const translated = intl.formatMessage({ id: translationKey });
    
    // If translation exists (not same as key), return it
    if (translated !== translationKey) {
      return translated;
    }
    
    // Otherwise return the original value
    return categoryKey;
  };

  const openDeleteSensitizationTrainingConfirmDialog = () => {
    coreConfirm(
      formatMessageWithValues('sensitizationTraining.delete.confirm.title', pageTitle(sensitizationTrainingToDelete)),
      formatMessage('sensitizationTraining.delete.confirm.message'),
    );
  };

  useEffect(() => sensitizationTrainingToDelete && openDeleteSensitizationTrainingConfirmDialog(), [sensitizationTrainingToDelete]);

  useEffect(() => {
    if (sensitizationTrainingToDelete && confirmed) {
      deleteSensitizationTraining(
        sensitizationTrainingToDelete,
        formatMessageWithValues('sensitizationTraining.mutation.deleteLabel', mutationLabel(sensitizationTrainingToDelete)),
      );
      setDeletedSensitizationTrainingUuids([...deletedSensitizationTrainingUuids, sensitizationTrainingToDelete.id]);
    }
    if (sensitizationTrainingToDelete && confirmed !== null) {
      setSensitizationTrainingToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const handleOpenValidationDialog = (training) => {
    setSelectedTraining(training);
    setValidationDialogOpen(true);
  };

  const handleCloseValidationDialog = () => {
    setValidationDialogOpen(false);
    setSelectedTraining(null);
  };

  const handleValidationComplete = () => {
    handleCloseValidationDialog();
    // Refresh the list
    fetchData({});
  };

  const renderValidationStatus = (training) => {
    const statusMap = {
      'PENDING': { icon: <HourglassEmptyIcon />, color: 'default', label: formatMessage('validation.status.pending') },
      'VALIDATED': { icon: <CheckCircleIcon />, color: 'primary', label: formatMessage('validation.status.validated') },
      'REJECTED': { icon: <CancelIcon />, color: 'secondary', label: formatMessage('validation.status.rejected') },
    };

    const status = training.validationStatus || 'PENDING';
    const statusConfig = statusMap[status] || statusMap['PENDING'];

    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        onClick={() => handleOpenValidationDialog(training)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const headers = () => [
    'sensitizationTraining.sensitization_date',
    'location.locationType.0',
    'location.locationType.1',
    'location.locationType.2',
    'sensitizationTraining.category',
    'participants.label',
    'validation.status',
  ];

  const sorts = () => [
    ['sensitization_date', true],
    ['location', true],
    ['category', true],
  ];

  const fetchData = (params) => fetchSensitizationTrainings(modulesManager, params);

  const rowIdentifier = (sensitizationTraining) => sensitizationTraining.id;

  const openSensitizationTraining = (sensitizationTraining) => rights.includes(RIGHT_SENSITIZATION_TRAINING_SEARCH) && history.push(
    `/${modulesManager.getRef(SENSITIZATION_TRAINING_ROUTE)}/${sensitizationTraining?.id}`,
  );

  const onDelete = (sensitizationTraining) => setSensitizationTrainingToDelete(sensitizationTraining);

  const renderParticipants = (training) => (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
      <Chip
        icon={<FaceIcon />}
        label={training.maleParticipants}
        size="small"
        style={{ backgroundColor: '#e3f2fd' }}
      />
      <Chip
        icon={<WcIcon />}
        label={training.femaleParticipants}
        size="small"
        style={{ backgroundColor: '#fce4ec' }}
      />
      {training.twaParticipants > 0 && (
        <Chip
          icon={<AccessibilityIcon />}
          label={`${training.twaParticipants} Twa`}
          size="small"
          style={{ backgroundColor: '#f3e5f5' }}
        />
      )}
    </Box>
  );

  const itemFormatters = () => [
    (sensitizationTraining) => sensitizationTraining.sensitizationDate,
    (sensitizationTraining) => sensitizationTraining.location.parent.parent.name,
    (sensitizationTraining) => sensitizationTraining.location.parent.name,
    (sensitizationTraining) => sensitizationTraining.location.name,
    (sensitizationTraining) => getCategoryLabel(sensitizationTraining.category),
    (sensitizationTraining) => renderParticipants(sensitizationTraining),
    (sensitizationTraining) => renderValidationStatus(sensitizationTraining),
  ];

  const onDoubleClick = (sensitizationTraining) => openSensitizationTraining(sensitizationTraining);

  const sensitizationTrainingFilter = ({ filters, onChangeFilters }) => (
    <SensitizationTrainingFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, sensitizationTraining) => deletedSensitizationTrainingUuids.includes(sensitizationTraining.id);

  const renderLegend = () => (
    <Paper style={{ padding: '12px 16px', marginBottom: 16, backgroundColor: '#f5f5f5' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
        {formatMessage('legend.title')}
      </Typography>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography variant="caption" style={{ fontWeight: 500 }}>
          {formatMessage('legend.participants')}:
        </Typography>
        <Chip
          icon={<FaceIcon />}
          label={formatMessage('legend.male')}
          size="small"
          style={{ backgroundColor: '#e3f2fd' }}
        />
        <Chip
          icon={<WcIcon />}
          label={formatMessage('legend.female')}
          size="small"
          style={{ backgroundColor: '#fce4ec' }}
        />
        <Chip
          icon={<AccessibilityIcon />}
          label={formatMessage('legend.twa')}
          size="small"
          style={{ backgroundColor: '#f3e5f5' }}
        />
      </Box>
    </Paper>
  );

  const exportFields = [
    'sensitization_date',
    'location',
    'category',
    'male_participants',
    'female_participants',
    'twa_participants',
  ];

  const exportFieldsColumns = {
    sensitization_date: 'sensitization_date',
    location: formatMessage('location'),
    category: formatMessage('sensitizationTraining.category'),
    male_participants: formatMessage('me.male_participants'),
    female_participants: formatMessage('me.female_participants'),
    twa_participants: formatMessage('me.twa_participants'),
  };

  const [sensitizationsExport, setSensitizationsExport] = useState();
  useEffect(() => {
    if (sensitizationsExport) {
      downloadExport(sensitizationsExport, `${formatMessage('sensitizationTraining.page.title')}.csv`)();
      setSensitizationsExport(null);
    }
  }, [sensitizationsExport]);

  const downloadSensitizationTrainings = async (params) => {
    const response = await fetch(`${baseApiUrl}/graphql`, {
      method: 'post',
      headers: apiHeaders(),
      body: JSON.stringify({
        query: `
          {
            sensitizationTrainingExport${!!params && params.length ? `(${params.join(',')})` : ''}
          }`,
      }),
    });

    if (!response.ok) {
      throw response;
    } else {
      const { data } = await response.json();
      setSensitizationsExport(data.sensitizationTrainingExport);
    }
  };

  return (
    <>
      {renderLegend()}
      <Searcher
        module="social_protection"
        fetch={fetchData}
        items={sensitizationTrainings}
        itemsPageInfo={pageInfo}
        fetchedItems={fetchedSensitizationTrainings}
        fetchingItems={fetchingSensitizationTrainings}
        errorItems={errorSensitizationTrainings}
        tableTitle={formatMessageWithValues('SensitizationTrainingSearcher.results', { totalCount })}
        headers={headers}
        itemFormatters={itemFormatters}
        sorts={sorts}
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        rowIdentifier={rowIdentifier}
        onDoubleClick={onDoubleClick}
        defaultFilters={defaultFilters()}
        rowDisabled={isRowDisabled}
        rowLocked={isRowDisabled}
        exportable
        exportFetch={downloadSensitizationTrainings}
        exportFields={exportFields}
        exportFieldsColumns={exportFieldsColumns}
        exportFieldLabel={formatMessage('export.label')}
      />
      {selectedTraining && (
        <ValidationDialog
          open={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          onValidationComplete={handleValidationComplete}
          type="sensitization"
          data={selectedTraining}
          detailFields={[
            { key: 'sensitizationDate', label: 'sensitizationTraining.sensitization_date' },
            { key: 'category', label: 'sensitizationTraining.category' },
            { key: 'location.name', label: 'location' },
            { key: 'maleParticipants', label: 'me.male_participants' },
            { key: 'femaleParticipants', label: 'me.female_participants' },
            { key: 'twaParticipants', label: 'me.twa_participants' },
            { key: 'topics', label: 'sensitizationTraining.topics' },
            { key: 'facilitator', label: 'sensitizationTraining.facilitator' },
          ]}
        />
      )}
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingSensitizationTrainings: state.socialProtection.fetchingSensitizationTrainings,
  fetchedSensitizationTrainings: state.socialProtection.fetchedSensitizationTrainings,
  errorSensitizationTrainings: state.socialProtection.errorSensitizationTrainings,
  sensitizationTrainings: state.socialProtection.sensitizationTrainings,
  pageInfo: state.socialProtection.sensitizationTrainingsPageInfo,
  totalCount: state.socialProtection.sensitizationTrainingsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSensitizationTrainings,
  deleteSensitizationTraining,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SensitizationTrainingSearcher);