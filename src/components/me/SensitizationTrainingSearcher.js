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

  const [sensitizationTrainingToDelete, setSensitizationTrainingToDelete] = useState(null);
  const [deletedSensitizationTrainingUuids, setDeletedSensitizationTrainingUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

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

  const headers = () => [
    'sensitizationTraining.sensitization_date',
    'sensitizationTraining.location',
    'sensitizationTraining.category',
    'sensitizationTraining.male_participants',
    'sensitizationTraining.female_participants',
    'sensitizationTraining.twa_participants',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['sensitization_date', true],
    ['location', true],
    ['category', true],
  ];

  const fetch = (params) => fetchSensitizationTrainings(modulesManager, params);

  const rowIdentifier = (sensitizationTraining) => sensitizationTraining.id;

  const openSensitizationTraining = (sensitizationTraining) => rights.includes(RIGHT_SENSITIZATION_TRAINING_SEARCH) && history.push(
    `/${modulesManager.getRef(SENSITIZATION_TRAINING_ROUTE)}/${sensitizationTraining?.id}`,
  );

  const onDelete = (sensitizationTraining) => setSensitizationTrainingToDelete(sensitizationTraining);

  const itemFormatters = () => [
    (sensitizationTraining) => sensitizationTraining.sensitizationDate,
    (sensitizationTraining) => sensitizationTraining.location.name,
    (sensitizationTraining) => sensitizationTraining.category,
    (sensitizationTraining) => sensitizationTraining.maleParticipants,
    (sensitizationTraining) => sensitizationTraining.femaleParticipants,
    (sensitizationTraining) => sensitizationTraining.twaParticipants,
    (sensitizationTraining) => (
      <Tooltip title={formatMessage('tooltip.viewDetails')}>
        <IconButton
          onClick={() => openSensitizationTraining(sensitizationTraining)}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
    (sensitizationTraining) => (
      <Tooltip title={formatMessage('tooltip.delete')}>
        <IconButton
          onClick={() => onDelete(sensitizationTraining)}
          disabled={deletedSensitizationTrainingUuids.includes(sensitizationTraining.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const onDoubleClick = (sensitizationTraining) => openSensitizationTraining(sensitizationTraining);

  const sensitizationTrainingFilter = ({ filters, onChangeFilters }) => (
    <SensitizationTrainingFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, sensitizationTraining) => deletedSensitizationTrainingUuids.includes(sensitizationTraining.id);

  return (
    <Searcher
      module="social_protection"
      FilterPane={sensitizationTrainingFilter}
      fetch={fetch}
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
    />
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