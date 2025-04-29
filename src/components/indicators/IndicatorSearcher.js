import React, { useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  Searcher,
  useHistory,
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  clearConfirm,
  coreConfirm,
  journalize,
  PublishedComponent,
} from '@openimis/fe-core';
import { fetchIndicators, deleteIndicator } from '../../actions';
import { RIGHT_INDICATOR_SEARCH, INDICATOR_ROUTE } from '../../constants';
import { ACTION_TYPE } from '../../reducer';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class IndicatorSearcher extends React.Component {
  state = {
    toDelete: null,
    deleted: [],
    filters: {
      name: null,
      section: null,
    },
  };

  componentDidUpdate(prevProps) {
    if (prevProps.confirmed !== this.props.confirmed && this.props.confirmed) {
      this.confirmedAction();
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      if (this.props.mutation?.actionType === ACTION_TYPE.DELETE_INDICATOR) {
        this.setState((state) => ({
          deleted: [...state.deleted, state.toDelete.id],
          toDelete: null,
        }));
      }
    }
  }

  fetch = (params) => {
    this.props.fetchIndicators(this.props.modulesManager, params);
  }

  headers = () => [
    {
      id: 'name',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicator.name'),
      sortable: true,
    },
    {
      id: 'section',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicator.section'),
      sortable: true,
    },
    {
      id: 'baseline',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicator.baseline'),
      sortable: true,
    },
    {
      id: 'target',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicator.target'),
      sortable: true,
    },
    {
      id: 'actions',
      label: formatMessage(this.props.intl, 'socialProtection', 'emptyLabel'),
      sortable: false,
    },
  ]

  openDeleteIndicatorConfirmDialog = (indicator) => {
    this.setState({ toDelete: indicator });
    this.confirmedAction = this.deleteIndicator;
    this.props.coreConfirm(
      formatMessage(this.props.intl, 'socialProtection', 'indicator.delete.confirm.title'),
      formatMessageWithValues(this.props.intl, 'socialProtection', 'indicator.delete.confirm.message', { name: indicator.name }),
    );
  }

  deleteIndicator = () => {
    this.props.deleteIndicator(
      this.state.toDelete,
      formatMessageWithValues(this.props.intl, 'socialProtection', 'indicator.mutation.deleteLabel', { name: this.state.toDelete.name }),
    );
    this.props.clearConfirm();
  }

  rowIdentifier = (r) => r.id

  rowDisabled = (row) => this.state.deleted.includes(row.id)

  onDoubleClick = (indicator, newTab = false) => {
    const { history, modulesManager } = this.props;
    history.push(`/${modulesManager.getRef(INDICATOR_ROUTE)}/${indicator.id}`, newTab);
  }

  onClickDelete = (indicator) => this.openDeleteIndicatorConfirmDialog(indicator)

  onChangeFilters = (filters) => {
    this.setState({ filters });
  };

  indicatorFilter = () => {
    const { intl } = this.props;
    const { filters } = this.state;
    return {
      title: formatMessage(intl, 'socialProtection', 'indicator.searchFilter.title'),
      items: [
        {
          id: 'name',
          value: filters.name,
          filter: 'name_Icontains',
          display: formatMessage(intl, 'socialProtection', 'indicator.name'),
        },
        {
          id: 'section',
          value: filters.section,
          filter: 'section_Id',
          display: formatMessage(intl, 'socialProtection', 'indicator.section'),
          format: (v) => v?.id,
          filter: (c) => c?.id,
          component: (props) => (
            <PublishedComponent
              pubRef="socialProtection.SectionPicker"
              withNull
              value={filters.section}
              onChange={(v) => this.onChangeFilters({ ...filters, section: v })}
            />
          ),
        },
      ],
    };
  }

  formatResult = (indicator) => {
    const { rights } = this.props;
    return {
      id: indicator.id,
      name: indicator.name,
      section: indicator.section?.name || '',
      baseline: indicator.baseline,
      target: indicator.target,
      actions: [
        {
          icon: <EditIcon />,
          tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.edit'),
          onClick: () => this.onDoubleClick(indicator),
        },
        rights.includes(RIGHT_INDICATOR_UPDATE) && {
          icon: <DeleteIcon />,
          tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.delete'),
          onClick: () => this.onClickDelete(indicator),
        },
      ],
    };
  }

  render() {
    const {
      intl, indicators, indicatorsPageInfo, fetchingIndicators,
      fetchingIndicators, errorIndicators, indicatorsTotalCount, modulesManager,
      classes, rights,
    } = this.props;

    return (
      <Searcher
        module="socialProtection"
        FilterPane={this.indicatorFilter}
        fetch={this.fetch}
        items={indicators}
        itemsPageInfo={indicatorsPageInfo}
        fetchingItems={fetchingIndicators}
        fetchedItems={!fetchingIndicators}
        errorItems={errorIndicators}
        tableTitle={formatMessageWithValues(intl, 'socialProtection', 'indicator.searcherResultsTitle', { count: indicatorsTotalCount ?? 0 })}
        itemsNber={indicatorsTotalCount}
        rowDisabled={this.rowDisabled}
        headers={this.headers}
        itemFormatters={this.formatResult}
        rowIdentifier={this.rowIdentifier}
        onDoubleClick={this.onDoubleClick}
        rights={rights}
      />
    );
  }
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

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(withTheme(withStyles(styles)(IndicatorSearcher)))
    )
  )
);
