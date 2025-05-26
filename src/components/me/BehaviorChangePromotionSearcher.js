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
  baseApiUrl,
  apiHeaders,
  downloadExport,
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
import ValidationDialog from '../dialogs/ValidationDialog';

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
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
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

  const handleOpenValidationDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setValidationDialogOpen(true);
  };

  const handleCloseValidationDialog = () => {
    setValidationDialogOpen(false);
    setSelectedPromotion(null);
  };

  const handleValidationComplete = () => {
    handleCloseValidationDialog();
    // Refresh the list
    fetchData({});
  };

  const renderValidationStatus = (promotion) => {
    const statusMap = {
      'PENDING': { icon: <HourglassEmptyIcon />, color: 'default', label: formatMessage('validation.status.pending') },
      'VALIDATED': { icon: <CheckCircleIcon />, color: 'primary', label: formatMessage('validation.status.validated') },
      'REJECTED': { icon: <CancelIcon />, color: 'secondary', label: formatMessage('validation.status.rejected') },
    };

    const status = promotion.validationStatus || 'PENDING';
    const statusConfig = statusMap[status] || statusMap['PENDING'];

    return (
      <Chip
        icon={statusConfig.icon}
        label={statusConfig.label}
        color={statusConfig.color}
        size="small"
        onClick={() => handleOpenValidationDialog(promotion)}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  const headers = () => [
    'behaviorChangePromotion.report_date',
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
    ['male_participants', true],
    ['female_participants', true],
    ['twa_participants', true],
  ];

  const fetchData = (params) => fetchBehaviorChangePromotions(modulesManager, params);

  const rowIdentifier = (behaviorChangePromotion) => behaviorChangePromotion.id;

  const openBehaviorChangePromotion = (behaviorChangePromotion) => rights.includes(RIGHT_BEHAVIOR_CHANGE_PROMOTION_SEARCH) && history.push(
    `/${modulesManager.getRef(BEHAVIOR_CHANGE_PROMOTION_ROUTE)}/${behaviorChangePromotion?.id}`,
  );

  const onDelete = (behaviorChangePromotion) => setBehaviorChangePromotionToDelete(behaviorChangePromotion);

  const itemFormatters = () => [
    (behaviorChangePromotion) => behaviorChangePromotion.reportDate,
    (behaviorChangePromotion) => behaviorChangePromotion.location.parent.parent.name,
    (behaviorChangePromotion) => behaviorChangePromotion.location.parent.name,
    (behaviorChangePromotion) => behaviorChangePromotion.location.name,
    (behaviorChangePromotion) => behaviorChangePromotion.maleParticipants,
    (behaviorChangePromotion) => behaviorChangePromotion.femaleParticipants,
    (behaviorChangePromotion) => behaviorChangePromotion.twaParticipants,
    (behaviorChangePromotion) => renderValidationStatus(behaviorChangePromotion),
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

  const exportFields = [
    'report_date',
    'location',
    'male_participants',
    'female_participants',
    'twa_participants',
  ];

  const exportFieldsColumns = {
    report_date: 'report_date',
    location: formatMessage('location'),
    male_participants: formatMessage('me.male_participants'),
    female_participants: formatMessage('me.female_participants'),
    twa_participants: formatMessage('me.twa_participants'),
  };

  const [promotionsExport, setPromotionsExport] = useState();
  useEffect(() => {
    if (promotionsExport) {
      downloadExport(promotionsExport, `${formatMessage('behaviorChangePromotion.page.title')}.csv`)();
      setPromotionsExport(null);
    }
  }, [promotionsExport]);

  const downloadBehaviorChangePromotions = async (params) => {
    const response = await fetch(`${baseApiUrl}/graphql`, {
      method: 'post',
      headers: apiHeaders(),
      body: JSON.stringify({
        query: `
          {
            behaviorChangePromotionExport${!!params && params.length ? `(${params.join(',')})` : ''}
          }`,
      }),
    });

    if (!response.ok) {
      throw response;
    } else {
      const { data } = await response.json();
      setPromotionsExport(data.behaviorChangePromotionExport);
    }
  };

  return (
    <>
      <Searcher
        module="social_protection"
        fetch={fetchData}
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
        exportable
        exportFetch={downloadBehaviorChangePromotions}
        exportFields={exportFields}
        exportFieldsColumns={exportFieldsColumns}
        exportFieldLabel={formatMessage('export.label')}
      />
      {selectedPromotion && (
        <ValidationDialog
          open={validationDialogOpen}
          onClose={handleCloseValidationDialog}
          onValidationComplete={handleValidationComplete}
          type="behavior_change"
          data={selectedPromotion}
          detailFields={[
            { key: 'reportDate', label: 'behaviorChangePromotion.report_date' },
            { key: 'location.name', label: 'location' },
            { key: 'maleParticipants', label: 'me.male_participants' },
            { key: 'femaleParticipants', label: 'me.female_participants' },
            { key: 'twaParticipants', label: 'me.twa_participants' },
            { key: 'activities', label: 'behaviorChangePromotion.activities' },
            { key: 'notes', label: 'behaviorChangePromotion.notes' },
          ]}
        />
      )}
    </>
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