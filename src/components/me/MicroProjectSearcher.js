import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
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

  const openDeleteMicroProjectConfirmDialog = () => {
    coreConfirm(
      formatMessageWithValues('microProject.delete.confirm.title', pageTitle(microProjectToDelete)),
      formatMessage('microProject.delete.confirm.message'),
    );
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

  const headers = () => [
    'microProject.report_date',
    'microProject.location',
    'microProject.male_participants',
    'microProject.female_participants',
    'microProject.twa_participants',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['report_date', true],
    ['location', true],
  ];

  const fetch = (params) => fetchMicroProjects(modulesManager, params);

  const rowIdentifier = (microProject) => microProject.id;

  const openMicroProject = (microProject) => rights.includes(RIGHT_MICRO_PROJECT_SEARCH) && history.push(
    `/${modulesManager.getRef(MICRO_PROJECT_ROUTE)}/${microProject?.id}`,
  );

  const onDelete = (microProject) => setMicroProjectToDelete(microProject);

  const itemFormatters = () => [
    (microProject) => microProject.reportDate,
    (microProject) => microProject.location.name,
    (microProject) => microProject.maleParticipants,
    (microProject) => microProject.femaleParticipants,
    (microProject) => microProject.twaParticipants,
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

  const onDoubleClick = (microProject) => openMicroProject(microProject);

  const microProjectFilter = ({ filters, onChangeFilters }) => (
    <MicroProjectFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, microProject) => deletedMicroProjectUuids.includes(microProject.id);

  return (
    <Searcher
      module="socialProtection"
      FilterPane={microProjectFilter}
      fetch={fetch}
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
    />
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