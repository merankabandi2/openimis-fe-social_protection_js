import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  Searcher,
  useModulesManager,
  useTranslations,
  journalize,
  useHistory,
  coreConfirm,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchMonetaryTransfers,
  deleteMonetaryTransfer,
} from '../../actions';
import {
  DEFAULT_PAGE_SIZE,
  MODULE_NAME,
  RIGHT_MONETARY_TRANSFER_SEARCH,
  ROWS_PER_PAGE_OPTIONS,
} from '../../constants';
import MonetaryTransferFilter from './MonetaryTransferFilter';
import { mutationLabel, pageTitle } from '../../util/string-utils';

function MonetaryTransferSearcher({
  fetchMonetaryTransfers,
  fetchingMonetaryTransfers,
  fetchedMonetaryTransfers,
  errorMonetaryTransfers,
  deleteMonetaryTransfer,
  monetaryTransfers,
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

  const [monetaryTransferToDelete, setMonetaryTransferToDelete] = useState(null);
  const [deletedMonetaryTransferUuids, setDeletedMonetaryTransferUuids] = useState([]);
  const prevSubmittingMutationRef = useRef();

  const openDeleteMonetaryTransferConfirmDialog = () => {
    coreConfirm(
      formatMessageWithValues('monetaryTransfer.delete.confirm.title', pageTitle(monetaryTransferToDelete)),
      formatMessage('monetaryTransfer.delete.confirm.message'),
    );
  };

  useEffect(() => monetaryTransferToDelete && openDeleteMonetaryTransferConfirmDialog(), [monetaryTransferToDelete]);

  useEffect(() => {
    if (monetaryTransferToDelete && confirmed) {
      deleteMonetaryTransfer(
        monetaryTransferToDelete,
        formatMessageWithValues('monetaryTransfer.mutation.deleteLabel', mutationLabel(monetaryTransferToDelete)),
      );
      setDeletedMonetaryTransferUuids([...deletedMonetaryTransferUuids, monetaryTransferToDelete.id]);
    }
    if (monetaryTransferToDelete && confirmed !== null) {
      setMonetaryTransferToDelete(null);
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
    'transferDate',
    'location',
    'programme',
    'paymentAgency',
    'Women',
    'Men',
    'Twa',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['transferDate', true],
    ['location', true],
    ['programme', true],
    ['paymentAgency', true],
  ];

  const fetch = (params) => fetchMonetaryTransfers(modulesManager, params);

  const rowIdentifier = (monetaryTransfer) => monetaryTransfer.id;

  const openMonetaryTransfer = (monetaryTransfer) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH) && history.push(
    `/${modulesManager.getRef('socialProtection.route.monetaryTransfer')}/${monetaryTransfer?.id}`,
  );

  const onDelete = (monetaryTransfer) => setMonetaryTransferToDelete(monetaryTransfer);

  const itemFormatters = () => [
    (monetaryTransfer) => monetaryTransfer.transferDate,
    (monetaryTransfer) => monetaryTransfer.location?.name,
    (monetaryTransfer) => monetaryTransfer.programme?.name,
    (monetaryTransfer) => monetaryTransfer.paymentAgency?.name,
    (monetaryTransfer) => `${monetaryTransfer?.paidWomen}/${monetaryTransfer.plannedWomen}`,
    (monetaryTransfer) => `${monetaryTransfer?.paidMen}/${monetaryTransfer.plannedMen}`,
    (monetaryTransfer) => `${monetaryTransfer?.paidTwa}/${monetaryTransfer.plannedTwa}`,
    (monetaryTransfer) => (
      <Tooltip title={formatMessage('tooltip.viewDetails')}>
        <IconButton
          onClick={() => openMonetaryTransfer(monetaryTransfer)}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    ),
    (monetaryTransfer) => (
      <Tooltip title={formatMessage('tooltip.delete')}>
        <IconButton
          onClick={() => onDelete(monetaryTransfer)}
          disabled={deletedMonetaryTransferUuids.includes(monetaryTransfer.id)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    ),
  ];

  const onDoubleClick = (monetaryTransfer) => openMonetaryTransfer(monetaryTransfer);

  const monetaryTransferFilter = ({ filters, onChangeFilters }) => (
    <MonetaryTransferFilter filters={filters} onChangeFilters={onChangeFilters} />
  );

  const defaultFilters = () => ({});

  const isRowDisabled = (_, monetaryTransfer) => deletedMonetaryTransferUuids.includes(monetaryTransfer.id);

  return (
    <Searcher
      module="social_protection"
      FilterPane={monetaryTransferFilter}
      fetch={fetch}
      items={monetaryTransfers}
      itemsPageInfo={pageInfo}
      fetchedItems={fetchedMonetaryTransfers}
      fetchingItems={fetchingMonetaryTransfers}
      errorItems={errorMonetaryTransfers}
      tableTitle={formatMessageWithValues('MonetaryTransferSearcher.results', { totalCount })}
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
  fetchingMonetaryTransfers: state.socialProtection.fetchingMonetaryTransfers,
  fetchedMonetaryTransfers: state.socialProtection.fetchedMonetaryTransfers,
  errorMonetaryTransfers: state.socialProtection.errorMonetaryTransfers,
  monetaryTransfers: state.socialProtection.monetaryTransfers,
  pageInfo: state.socialProtection.monetaryTransfersPageInfo,
  totalCount: state.socialProtection.monetaryTransfersTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchMonetaryTransfers,
  deleteMonetaryTransfer,
  journalize,
  clearConfirm,
  coreConfirm,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MonetaryTransferSearcher);
