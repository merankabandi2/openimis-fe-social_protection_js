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
import { deleteBehaviorChangePromotion, fetchBehaviorChangePromotions } from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  BEHAVIOR_CHANGE_PROMOTION_ROUTE,
  RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import { mutationLabel, pageTitle } from '../../util/string-utils';
import BehaviorChangePromotionFilter from './BehaviorChangePromotionFilter';

function BehaviorChangePromotionSearcher({
  fetchBehaviorChangePromotions,
  fetchingBehaviorChangePromotions,
  fetchedBehaviorChangePromotions,
  errorBehaviorChangePromotions,
  deleteBehaviorChangePromotion,
  behaviorChangePromotions,
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

  const [behaviorChangePromotionToDelete, setBehaviorChangePromotionToDelete] = useState(null);
  const [deletedBehaviorChangePromotionUuids, setDeletedBehaviorChangePromotionUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteBehaviorChangePromotionConfirmDialog = () => {
    coreConfirm(
      formatMessageWithValues('behaviorChangePromotion.delete.confirm.title', pageTitle(behaviorChangePromotionToDelete)),
      formatMessage('behaviorChangePromotion.delete.confirm.message'),
    );
  };

  useEffect(() => behaviorChangePromotionToDelete && openDeleteBehaviorChangePromotionConfirmDialog(), [behaviorChangePromotionToDelete]);

  useEffect(() => {
    if (behaviorChangePromotionToDelete && confirmed) {
      deleteBehaviorChangePromotion(
        behaviorChangePromotionToDelete,
        formatMessageWithValues('behaviorChangePromotion.mutation.deleteLabel', mutationLabel(behaviorChangePromotionToDelete)),
      );
      setDeletedBehaviorChangePromotionUuids([...deletedBehaviorChangePromotionUuids, behaviorChangePromotionToDelete.id]);
    }
    if (behaviorChangePromotionToDelete && confirmed !== null) {
      setBehaviorChangePromotionToDelete(null);
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
    'behaviorChangePromotion.report_date',
    'behaviorChangePromotion.location',
    'behaviorChangePromotion.male_participants',
    'behaviorChangePromotion.female_participants',
    'behaviorChangePromotion.twa_participants',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['report_date', true],
    ['location', true],
    ['male_participants', true],
    ['female_participants', true],
    ['twa_participants', true],
  ];

  const fetch = (params) => fetchBehaviorChangePromotions(modulesManager, params);

  const rowIdentifier = (behaviorChangePromotion) => behaviorChangePromotion.id;

  const openBehaviorChangePromotion = (behaviorChangePromotion) => rights.includes(RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH) && history.push(
    `/${modulesManager.getRef(BEHAVIOR_CHANGE_PROMOTION_ROUTE)}/${behaviorChangePromotion?.id}`,
  );

  const onDelete = (behaviorChangePromotion) => setBehaviorChangePromotionToDelete(behaviorChangePromotion);

  const itemFormatters = () => [
    (behaviorChangePromotion) => behaviorChangePromotion.reportDate,
    (behaviorChangePromotion) => behaviorChangePromotion.location.name,
    (behaviorChangePromotion) => behaviorChangePromotion.maleParticipants,
    (behaviorChangePromotion) => behaviorChangePromotion.femaleParticipants,
    (behaviorChangePromotion) => behaviorChangePromotion.twaParticipants,
    (behaviorChangePromotion) => (
      <Tooltip title={formatMessage('tooltip.viewDetails')}>
        <IconButton
          onClick={() => openBehaviorChangePromotion(behaviorChangePromotion)}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
    (behaviorChangePromotion) => (
      <Tooltip title={formatMessage('tooltip.delete')}>
        <IconButton
          onClick={() => onDelete(behaviorChangePromotion)}
          disabled={deletedBehaviorChangePromotionUuids.includes(behaviorChangePromotion.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const onDoubleClick = (behaviorChangePromotion) => openBehaviorChangePromotion(behaviorChangePromotion);

  const behaviorChangePromotionFilter = ({ filters, onChangeFilters }) => (
    <BehaviorChangePromotionFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, behaviorChangePromotion) => deletedBehaviorChangePromotionUuids.includes(behaviorChangePromotion.id);

  return (
    <Searcher
      module="social_protection"
      FilterPane={behaviorChangePromotionFilter}
      fetch={fetch}
      items={behaviorChangePromotions}
      itemsPageInfo={pageInfo}
      fetchedItems={fetchedBehaviorChangePromotions}
      fetchingItems={fetchingBehaviorChangePromotions}
      errorItems={errorBehaviorChangePromotions}
      tableTitle={formatMessageWithValues('BehaviorChangePromotionSearcher.results', { totalCount })}
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
  fetchingBehaviorChangePromotions: state.socialProtection.fetchingBehaviorChangePromotions,
  fetchedBehaviorChangePromotions: state.socialProtection.fetchedBehaviorChangePromotions,
  errorBehaviorChangePromotions: state.socialProtection.errorBehaviorChangePromotions,
  behaviorChangePromotions: state.socialProtection.behaviorChangePromotions,
  pageInfo: state.socialProtection.behaviorChangePromotionsPageInfo,
  totalCount: state.socialProtection.behaviorChangePromotionsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBehaviorChangePromotions,
  deleteBehaviorChangePromotion,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BehaviorChangePromotionSearcher);