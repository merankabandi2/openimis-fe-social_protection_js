import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  clearConfirm,
  coreConfirm,
  journalize,
  PublishedComponent,
} from '@openimis/fe-core';
import { fetchIndicators, deleteIndicator } from '../../actions';
import { INDICATOR_ROUTE, RIGHT_INDICATOR_UPDATE } from '../../constants';
import { ACTION_TYPE } from '../../reducer';

function IndicatorSearcher({
  fetchIndicators,
  fetchingIndicators,
  fetchedIndicators,
  errorIndicators,
  deleteIndicator,
  indicators,
  coreConfirm,
  clearConfirm,
  indicatorsPageInfo,
  indicatorsTotalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const [indicatorToDelete, setIndicatorToDelete] = useState(null);
  const [deletedIndicatorIds, setDeletedIndicatorIds] = useState([]);
  const [filters, setFilters] = useState({
    name: null,
    section: null,
  });
  const prevSubmittingMutationRef = useRef();

  const openDeleteIndicatorConfirmDialog = () => {
    coreConfirm(
      formatMessage('indicator.deleteConfirm.title'),
      formatMessageWithValues('indicator.deleteConfirm.message', { name: indicatorToDelete.name }),
    );
  };

  useEffect(() => indicatorToDelete && openDeleteIndicatorConfirmDialog(), [indicatorToDelete]);

  useEffect(() => {
    if (indicatorToDelete && confirmed) {
      deleteIndicator(
        indicatorToDelete,
        formatMessage('indicator.deleteConfirm.mutationLabel'),
      );
      setDeletedIndicatorIds([...deletedIndicatorIds, indicatorToDelete.id]);
    }
    if (indicatorToDelete && confirmed !== null) {
      setIndicatorToDelete(null);
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
    'indicator.name',
    'indicator.section',
    'indicator.baseline',
    'indicator.target',
    'emptyLabel',
  ];

  const sorts = () => [
    ['name', true],
    ['section', true],
  ];

  const fetchData = (params) => fetchIndicators(params);

  const rowIdentifier = (indicator) => indicator.id;

  const openIndicator = (indicator) => history.push(
    `/${modulesManager.getRef(INDICATOR_ROUTE)}/${indicator?.id}`,
  );

  const onDelete = (indicator) => setIndicatorToDelete(indicator);

  const itemFormatters = () => [
    (indicator) => indicator.name,
    (indicator) => indicator.section?.name || '',
    (indicator) => indicator.baseline,
    (indicator) => indicator.target,
    (indicator) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton
            onClick={() => openIndicator(indicator)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        {rights.includes(RIGHT_INDICATOR_UPDATE) && (
          <Tooltip title={formatMessage('tooltip.delete')}>
            <IconButton
              onClick={() => onDelete(indicator)}
              disabled={deletedIndicatorIds.includes(indicator.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  const onDoubleClick = (indicator) => openIndicator(indicator);

  const indicatorFilter = ({ filters, onChangeFilters }) => {
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <label>{formatMessage('indicator.name')}</label>
          <input 
            type="text" 
            value={filters.name || ''} 
            onChange={(e) => onChangeFilters({ ...filters, name: e.target.value })}
            style={{ marginLeft: '8px' }}
          />
        </div>
        <div>
          <label>{formatMessage('indicator.section')}</label>
          <div style={{ display: 'inline-block', marginLeft: '8px' }}>
            <PublishedComponent
              pubRef="socialProtection.SectionPicker"
              withNull
              value={filters.section}
              onChange={(v) => onChangeFilters({ ...filters, section: v })}
            />
          </div>
        </div>
      </div>
    );
  };

  const defaultFilters = () => ({});

  const isRowDisabled = (_, indicator) => deletedIndicatorIds.includes(indicator.id);

  return (
    <Searcher
      module="socialProtection"
      fetch={fetchData}
      items={indicators}
      itemsPageInfo={indicatorsPageInfo}
      fetchedItems={!fetchingIndicators}
      fetchingItems={fetchingIndicators}
      errorItems={errorIndicators}
      tableTitle={formatMessageWithValues('indicator.searcherResultsTitle', { count: indicatorsTotalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
      FilterPane={indicatorFilter}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  indicators: state.socialProtection.indicators,
  indicatorsPageInfo: state.socialProtection.indicatorsPageInfo,
  fetchingIndicators: state.socialProtection.fetchingIndicators,
  errorIndicators: state.socialProtection.errorIndicators,
  indicatorsTotalCount: state.socialProtection.indicatorsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchIndicators,
  deleteIndicator,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorSearcher);
