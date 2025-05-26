import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip, Chip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
  baseApiUrl, apiHeaders,
  downloadExport,
} from '@openimis/fe-core';
import { fetchMicroProjects, deleteMicroProject } from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  MICRO_PROJECT_ROUTE,
  RIGHT_MICRO_PROJECT_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import { mutationLabel, pageTitle } from '../../util/string-utils';
import MicroProjectFilter from './MicroProjectFilter';
import ValidationDialog from '../dialogs/ValidationDialog';

function MicroProjectSearcher({
  fetchMicroProjects,
  fetchingMicroProjects,
  fetchedMicroProjects,
  errorMicroProjects,
  deleteMicroProject,
  microProjects,
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

  const [microProjectToDelete, setMicroProjectToDelete] = useState(null);
  const [deletedMicroProjectUuids, setDeletedMicroProjectUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedMicroProject, setSelectedMicroProject] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openDeleteMicroProjectConfirmDialog = () => {
    coreConfirm(
      formatMessageWithValues('microProject.delete.confirm.title', pageTitle(microProjectToDelete)),
      formatMessage('microProject.delete.confirm.message'),
    );
  };

  const exportFields = [
    'report_date',
    'location',
    'male_participants',
    'female_participants',
    'twa_participants',
    'agriculture_beneficiaries',
    'livestock_beneficiaries',
    'livestock_goat_beneficiaries',
    'livestock_pig_beneficiaries',
    'livestock_rabbit_beneficiaries',
    'livestock_poultry_beneficiaries',
    'livestock_cattle_beneficiaries',
    'commerce_services_beneficiaries',
  ];
  const exportFieldsColumns = {
    report_date: 'report_date',
    location: formatMessage('location'),
    male_participants: formatMessage('me.male_participants'),
    female_participants: formatMessage('me.female_participants'),
    twa_participants: formatMessage('me.twa_participants'),
    agriculture_beneficiaries: formatMessage('me.agriculture_beneficiaries'),
    livestock_beneficiaries: formatMessage('me.livestock_beneficiaries'),
    livestock_goat_beneficiaries: formatMessage('me.livestock_goat_beneficiaries'),
    livestock_pig_beneficiaries: formatMessage('me.livestock_pig_beneficiaries'),
    livestock_rabbit_beneficiaries: formatMessage('me.livestock_rabbit_beneficiaries'),
    livestock_poultry_beneficiaries: formatMessage('me.livestock_poultry_beneficiaries'),
    livestock_cattle_beneficiaries: formatMessage('me.livestock_cattle_beneficiaries'),
    commerce_services_beneficiaries: formatMessage('me.commerce_services_beneficiaries'),
  };

  useEffect(() => microProjectToDelete && openDeleteMicroProjectConfirmDialog(), [microProjectToDelete]);

  useEffect(() => {
    if (microProjectToDelete && confirmed) {
      deleteMicroProject(
        microProjectToDelete,
        formatMessageWithValues('microProject.mutation.deleteLabel', mutationLabel(microProjectToDelete)),
      );
      setDeletedMicroProjectUuids([...deletedMicroProjectUuids, microProjectToDelete.id]);
    }
    if (microProjectToDelete && confirmed !== null) {
      setMicroProjectToDelete(null);
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

  const openValidationDialog = (microProject) => {
    setSelectedMicroProject(microProject);
    setValidationDialogOpen(true);
  };

  const handleValidationClose = () => {
    setValidationDialogOpen(false);
    setSelectedMicroProject(null);
  };

  const handleValidated = () => {
    // Refresh the data after validation
    setRefreshKey(refreshKey + 1);
  };

  const headers = () => [
    'microProject.report_date',
    'location.locationType.0',
    'location.locationType.1',
    'location.locationType.2',
    'me.male_participants',
    'me.female_participants',
    'me.twa_participants',
    'validation.status',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['report_date', true],
    ['location', true],
  ];

  const fetchData = (params) => fetchMicroProjects(modulesManager, params);

  const rowIdentifier = (microProject) => microProject.id;

  const openMicroProject = (microProject) => rights.includes(RIGHT_MICRO_PROJECT_SEARCH) && history.push(
    `/${modulesManager.getRef(MICRO_PROJECT_ROUTE)}/${microProject?.id}`,
  );

  const onDelete = (microProject) => setMicroProjectToDelete(microProject);

  const renderValidationStatus = (microProject) => {
    const statusMap = {
      'PENDING': { icon: <HourglassEmptyIcon />, color: 'default', label: formatMessage('validation.status.pending') },
      'VALIDATED': { icon: <CheckCircleIcon />, color: 'primary', label: formatMessage('validation.status.validated') },
      'REJECTED': { icon: <CancelIcon />, color: 'secondary', label: formatMessage('validation.status.rejected') },
    };
    
    const status = statusMap[microProject.validationStatus] || statusMap['PENDING'];
    
    return (
      <Chip
        icon={status.icon}
        label={status.label}
        color={status.color}
        size="small"
        onClick={() => openValidationDialog(microProject)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const itemFormatters = () => [
    (microProject) => microProject.reportDate,
    (microProject) => microProject.location.parent.parent.name,
    (microProject) => microProject.location.parent.name,
    (microProject) => microProject.location.name,
    (microProject) => microProject.maleParticipants,
    (microProject) => microProject.femaleParticipants,
    (microProject) => microProject.twaParticipants,
    (microProject) => renderValidationStatus(microProject),
    (microProject) => (
      <Tooltip title={formatMessage('tooltip.viewDetails')}>
        <IconButton
          onClick={() => openMicroProject(microProject)}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
    (microProject) => (
      <Tooltip title={formatMessage('tooltip.delete')}>
        <IconButton
          onClick={() => onDelete(microProject)}
          disabled={deletedMicroProjectUuids.includes(microProject.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const [indicatorsExport, setIndicatorsExport] = useState();
  useEffect(() => {
    if (indicatorsExport) {
      downloadExport(indicatorsExport, `${formatMessage('microProject.page.title')}.csv`)();
      setIndicatorsExport(null);
    }
  }, [indicatorsExport]);

  const downloadIndicators = async (params) => {
    const response = await fetch(`${baseApiUrl}/graphql`, {
      method: 'post',
      headers: apiHeaders(),
      body: JSON.stringify({
        query: `
          {
            microProjectExport${!!params && params.length ? `(${params.join(',')})` : ''}
          }`,
      }),
    });

    if (!response.ok) {
      throw response;
    } else {
      const { data } = await response.json();
      setIndicatorsExport(data.microProjectExport);
    }
  };

  const onDoubleClick = (microProject) => openMicroProject(microProject);

  const microProjectFilter = ({ filters, onChangeFilters }) => (
    <MicroProjectFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, microProject) => deletedMicroProjectUuids.includes(microProject.id);

  return (
    <>
      <Searcher
        module="socialProtection"
        fetch={fetchData}
        items={microProjects}
        itemsPageInfo={pageInfo}
        fetchedItems={fetchedMicroProjects}
        fetchingItems={fetchingMicroProjects}
        errorItems={errorMicroProjects}
        tableTitle={formatMessageWithValues('MicroProjectSearcher.results', { totalCount })}
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
        exportFetch={downloadIndicators}
        exportFields={exportFields}
        exportFieldsColumns={exportFieldsColumns}
        exportFieldLabel={formatMessage('export.label')}
        key={refreshKey}
      />
      <ValidationDialog
        open={validationDialogOpen}
        onClose={handleValidationClose}
        data={selectedMicroProject}
        type="microproject"
        onValidated={handleValidated}
      />
    </>
  );
}

const mapStateToProps = (state) => ({
  fetchingMicroProjects: state.socialProtection.fetchingMicroProjects,
  fetchedMicroProjects: state.socialProtection.fetchedMicroProjects,
  errorMicroProjects: state.socialProtection.errorMicroProjects,
  microProjects: state.socialProtection.microProjects,
  pageInfo: state.socialProtection.microProjectsPageInfo,
  totalCount: state.socialProtection.microProjectsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchMicroProjects,
  deleteMicroProject,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MicroProjectSearcher);
