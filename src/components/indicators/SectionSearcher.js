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
} from '@openimis/fe-core';
import { fetchSections, deleteSection } from '../../actions';
import { RIGHT_SECTION_SEARCH, SECTION_ROUTE } from '../../constants';
import { ACTION_TYPE } from '../../reducer';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class SectionSearcher extends React.Component {
  state = {
    toDelete: null,
    deleted: [],
  };

  componentDidUpdate(prevProps) {
    if (prevProps.confirmed !== this.props.confirmed && this.props.confirmed) {
      this.confirmedAction();
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      if (this.props.mutation?.actionType === ACTION_TYPE.DELETE_SECTION) {
        this.setState((state) => ({
          deleted: [...state.deleted, state.toDelete.id],
          toDelete: null,
        }));
      }
    }
  }

  fetch = (params) => {
    this.props.fetchSections(this.props.modulesManager, params);
  }

  headers = () => [
    {
      id: 'name',
      label: formatMessage(this.props.intl, 'socialProtection', 'section.name'),
      sortable: true,
    },
    {
      id: 'actions',
      label: formatMessage(this.props.intl, 'socialProtection', 'emptyLabel'),
      sortable: false,
    },
  ]

  openDeleteSectionConfirmDialog = (section) => {
    this.setState({ toDelete: section });
    this.confirmedAction = this.deleteSection;
    this.props.coreConfirm(
      formatMessage(this.props.intl, 'socialProtection', 'section.delete.confirm.title'),
      formatMessageWithValues(this.props.intl, 'socialProtection', 'section.delete.confirm.message', { name: section.name }),
    );
  }

  deleteSection = () => {
    this.props.deleteSection(
      this.state.toDelete,
      formatMessageWithValues(this.props.intl, 'socialProtection', 'section.mutation.deleteLabel', { name: this.state.toDelete.name }),
    );
    this.props.clearConfirm();
  }

  rowIdentifier = (r) => r.id

  rowDisabled = (row) => this.state.deleted.includes(row.id)

  onDoubleClick = (section, newTab = false) => {
    const { history, modulesManager } = this.props;
    history.push(`/${modulesManager.getRef(SECTION_ROUTE)}/${section.id}`, newTab);
  }

  onClickDelete = (section) => this.openDeleteSectionConfirmDialog(section)

  sectionFilter = () => {
    const { intl } = this.props;
    return {
      title: formatMessage(intl, 'socialProtection', 'section.searchFilter.title'),
      items: [
        {
          id: 'name',
          value: filters.name,
          filter: 'name_Icontains',
          display: formatMessage(intl, 'socialProtection', 'section.name'),
        },
      ],
    };
  }

  formatResult = (section) => {
    const { rights } = this.props;
    return {
      id: section.id,
      name: section.name,
      actions: [
        {
          icon: <EditIcon />,
          tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.edit'),
          onClick: () => this.onDoubleClick(section),
        },
        rights.includes(RIGHT_SECTION_UPDATE) && {
          icon: <DeleteIcon />,
          tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.delete'),
          onClick: () => this.onClickDelete(section),
        },
      ],
    };
  }

  render() {
    const {
      intl, sections, sectionsPageInfo, fetchingSections,
      fetchingIndicators, errorSections, sectionsTotalCount, modulesManager,
      classes, rights,
    } = this.props;

    return (
      <Searcher
        module="socialProtection"
        FilterPane={this.sectionFilter}
        fetch={this.fetch}
        items={sections}
        itemsPageInfo={sectionsPageInfo}
        fetchingItems={fetchingSections}
        fetchedItems={!fetchingSections}
        errorItems={errorSections}
        tableTitle={formatMessageWithValues(intl, 'socialProtection', 'section.searcherResultsTitle', { count: sectionsTotalCount ?? 0 })}
        itemsNber={sectionsTotalCount}
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
  sections: state.socialProtection.sections,
  sectionsPageInfo: state.socialProtection.sectionsPageInfo,
  fetchingSections: state.socialProtection.fetchingSections,
  errorSections: state.socialProtection.errorSections,
  sectionsTotalCount: state.socialProtection.sectionsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSections,
  deleteSection,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(withTheme(withStyles(styles)(SectionSearcher)))
    )
  )
);
