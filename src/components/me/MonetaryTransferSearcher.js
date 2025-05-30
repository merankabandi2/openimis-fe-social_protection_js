import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip, Button, Chip, Box, Typography, Paper } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';
import FaceIcon from '@material-ui/icons/Face';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';

import {
  Searcher,
  useModulesManager,
  useTranslations,
  journalize,
  useHistory,
  coreConfirm,
  clearConfirm,
  baseApiUrl,
  apiHeaders,
  downloadExport,
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
import MonetaryTransferUploadDialog from '../dialogs/MonetaryTransferUploadDialog';
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
  const [filters, setFilters] = useState({});
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
    'beneficiaries.planned',
    'beneficiaries.paid',
    'plannedAmount',
    'transferredAmount',
    'emptyLabel',
    'emptyLabel',
  ];

  const sorts = () => [
    ['transferDate', true],
    ['location', true],
    ['programme', true],
    ['paymentAgency', true],
  ];

  const fetchData = (params) => fetchMonetaryTransfers(modulesManager, params);

  const rowIdentifier = (monetaryTransfer) => monetaryTransfer.id;

  const openMonetaryTransfer = (monetaryTransfer) => rights.includes(RIGHT_MONETARY_TRANSFER_SEARCH) && history.push(
    `/${modulesManager.getRef('socialProtection.route.monetaryTransfer')}/${monetaryTransfer?.id}`,
  );

  const onDelete = (monetaryTransfer) => setMonetaryTransferToDelete(monetaryTransfer);

  const renderBeneficiaries = (monetaryTransfer, type) => {
    const isPlanned = type === 'planned';
    const women = isPlanned ? monetaryTransfer.plannedWomen : monetaryTransfer.paidWomen;
    const men = isPlanned ? monetaryTransfer.plannedMen : monetaryTransfer.paidMen;
    const twa = isPlanned ? monetaryTransfer.plannedTwa : monetaryTransfer.paidTwa;
    
    // Calculate payment status for paid beneficiaries
    const womenStatus = !isPlanned && monetaryTransfer.plannedWomen > 0 
      ? monetaryTransfer.paidWomen >= monetaryTransfer.plannedWomen 
      : null;
    const menStatus = !isPlanned && monetaryTransfer.plannedMen > 0 
      ? monetaryTransfer.paidMen >= monetaryTransfer.plannedMen 
      : null;
    const twaStatus = !isPlanned && monetaryTransfer.plannedTwa > 0 
      ? monetaryTransfer.paidTwa >= monetaryTransfer.plannedTwa 
      : null;
    
    return (
      <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
        <Chip
          icon={<WcIcon />}
          label={women}
          size="small"
          style={{ 
            backgroundColor: isPlanned ? '#fce4ec' : (womenStatus === true ? '#c8e6c9' : womenStatus === false ? '#ffcdd2' : '#fce4ec')
          }}
        />
        <Chip
          icon={<FaceIcon />}
          label={men}
          size="small"
          style={{ 
            backgroundColor: isPlanned ? '#e3f2fd' : (menStatus === true ? '#c8e6c9' : menStatus === false ? '#ffcdd2' : '#e3f2fd')
          }}
        />
        {(twa > 0 || (!isPlanned && monetaryTransfer.plannedTwa > 0)) && (
          <Chip
            icon={<AccessibilityIcon />}
            label={`${twa} Twa`}
            size="small"
            style={{ 
              backgroundColor: isPlanned ? '#f3e5f5' : (twaStatus === true ? '#c8e6c9' : twaStatus === false ? '#ffcdd2' : '#f3e5f5')
            }}
          />
        )}
      </Box>
    );
  };

  // Helper function to format currency amounts
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 BIF';
    return `${Number(amount).toLocaleString('fr-FR')} BIF`;
  };

  const itemFormatters = () => [
    (monetaryTransfer) => monetaryTransfer.transferDate,
    (monetaryTransfer) => monetaryTransfer.location?.name,
    (monetaryTransfer) => monetaryTransfer.programme?.name,
    (monetaryTransfer) => monetaryTransfer.paymentAgency?.name,
    (monetaryTransfer) => renderBeneficiaries(monetaryTransfer, 'planned'),
    (monetaryTransfer) => renderBeneficiaries(monetaryTransfer, 'paid'),
    (monetaryTransfer) => formatCurrency(monetaryTransfer.plannedAmount),
    (monetaryTransfer) => formatCurrency(monetaryTransfer.transferredAmount),
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

  const monetaryTransferFilter = ({ filters, onChangeFilters }) => {
    // Update internal filters state when filters change
    setFilters(filters);
    return <MonetaryTransferFilter filters={filters} onChangeFilters={onChangeFilters} />;
  };

  const defaultFilters = () => ({});

  const isRowDisabled = (_, monetaryTransfer) => deletedMonetaryTransferUuids.includes(monetaryTransfer.id);

  const exportFields = [
    'transfer_date',
    'location',
    'programme',
    'payment_agency',
    'planned_women',
    'paid_women',
    'planned_men',
    'paid_men',
    'planned_twa',
    'paid_twa',
    'planned_amount',
    'transferred_amount',
  ];

  const exportFieldsColumns = {
    transfer_date: 'transfer_date',
    location: formatMessage('location'),
    programme: formatMessage('programme'),
    payment_agency: formatMessage('paymentAgency'),
    planned_women: formatMessage('plannedWomen'),
    paid_women: formatMessage('paidWomen'),
    planned_men: formatMessage('plannedMen'),
    paid_men: formatMessage('paidMen'),
    planned_twa: formatMessage('plannedTwa'),
    paid_twa: formatMessage('paidTwa'),
    planned_amount: formatMessage('plannedAmount'),
    transferred_amount: formatMessage('transferredAmount'),
  };

  const [transfersExport, setTransfersExport] = useState();
  useEffect(() => {
    if (transfersExport) {
      downloadExport(transfersExport, `${formatMessage('monetaryTransfer.page.title')}.csv`)();
      setTransfersExport(null);
    }
  }, [transfersExport]);

  const downloadMonetaryTransfers = async (params) => {
    const response = await fetch(`${baseApiUrl}/graphql`, {
      method: 'post',
      headers: apiHeaders(),
      body: JSON.stringify({
        query: `
          {
            monetaryTransferExport${!!params && params.length ? `(${params.join(',')})` : ''}
          }`,
      }),
    });

    if (!response.ok) {
      throw response;
    } else {
      const { data } = await response.json();
      setTransfersExport(data.monetaryTransferExport);
    }
  };

  const downloadExcel = async () => {
    try {
      // Build query params from current filters
      const queryParams = new URLSearchParams();
      
      if (filters.transferDate_Gte) {
        queryParams.append('start_date', filters.transferDate_Gte);
      }
      if (filters.transferDate_Lte) {
        queryParams.append('end_date', filters.transferDate_Lte);
      }
      if (filters.location) {
        queryParams.append('location_id', filters.location);
      }
      if (filters.programme) {
        queryParams.append('programme_id', filters.programme);
      }
      if (filters.paymentAgency) {
        queryParams.append('payment_agency_id', filters.paymentAgency);
      }

      const response = await fetch(
        `${baseApiUrl}/merankabandi/monetary-transfers/export/?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: apiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `transferts_monetaires_${timestamp}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  const onRefresh = () => {
    fetchData(filters);
  };

  const renderLegend = () => (
    <Paper style={{ padding: '12px 16px', marginBottom: 16, backgroundColor: '#f5f5f5' }}>
      <Typography variant="subtitle2" style={{ fontWeight: 600, marginBottom: 8 }}>
        {formatMessage('legend.title')}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" style={{ fontWeight: 500 }}>
            {formatMessage('legend.beneficiaries')}:
          </Typography>
          <Chip
            icon={<WcIcon />}
            label={formatMessage('legend.women')}
            size="small"
            style={{ backgroundColor: '#fce4ec' }}
          />
          <Chip
            icon={<FaceIcon />}
            label={formatMessage('legend.men')}
            size="small"
            style={{ backgroundColor: '#e3f2fd' }}
          />
          <Chip
            icon={<AccessibilityIcon />}
            label={formatMessage('legend.twa')}
            size="small"
            style={{ backgroundColor: '#f3e5f5' }}
          />
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography variant="caption" style={{ fontWeight: 500 }}>
            {formatMessage('legend.paymentStatus')}:
          </Typography>
          <Chip
            icon={<CheckCircleIcon />}
            label={formatMessage('legend.fullyPaid')}
            size="small"
            style={{ backgroundColor: '#c8e6c9' }}
          />
          <Chip
            icon={<CancelIcon />}
            label={formatMessage('legend.partiallyPaid')}
            size="small"
            style={{ backgroundColor: '#ffcdd2' }}
          />
        </Box>
      </Box>
    </Paper>
  );

  return (
    <>
      <Box display="flex" justifyContent="flex-end" marginBottom={2} gap={1}>
        <MonetaryTransferUploadDialog 
          onUploadSuccess={onRefresh}
        />
        <Button
          variant="contained"
          color="default"
          startIcon={<GetAppIcon />}
          onClick={downloadExcel}
        >
          {formatMessage('monetaryTransfer.export.excel')}
        </Button>
      </Box>
      {renderLegend()}
      <Searcher
        module="social_protection"
        fetch={fetchData}
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
        exportable
        exportFetch={downloadMonetaryTransfers}
        exportFields={exportFields}
        exportFieldsColumns={exportFieldsColumns}
        exportFieldLabel={formatMessage('export.label')}
        FilterPane={monetaryTransferFilter}
      />
    </>
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
