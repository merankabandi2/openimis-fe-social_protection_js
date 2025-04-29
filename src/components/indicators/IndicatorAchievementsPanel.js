import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import { Grid, Paper, Typography, Divider, Button } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  withModulesManager,
  formatMessage,
  formatMessageWithValues,
  Searcher,
  coreConfirm,
  journalize,
  clearConfirm,
} from '@openimis/fe-core';
import {
  fetchIndicatorAchievements,
  deleteIndicatorAchievement,
} from '../../actions';
import IndicatorAchievementDialog from './IndicatorAchievementDialog';
import { MODULE_NAME, RIGHT_INDICATOR_ACHIEVEMENT_SEARCH } from '../../constants';
import { ACTION_TYPE } from '../../reducer';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  paperHeader: theme.paper.header,
});

class IndicatorAchievementsPanel extends React.Component {
  state = {
    dialogOpen: false,
    editedAchievement: null,
  };

  componentDidMount() {
    const { indicator, fetchIndicatorAchievements, modulesManager } = this.props;
    if (indicator?.id) {
      fetchIndicatorAchievements(modulesManager, `indicator_Id: "${indicator.id}"`);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.confirmed !== this.props.confirmed && this.props.confirmed) {
      this.confirmedAction();
    }

    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      if (this.props.mutation?.actionType === ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT ||
          this.props.mutation?.actionType === ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT ||
          this.props.mutation?.actionType === ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT) {
        this.refreshData();
      }
    }
  }

  refreshData = () => {
    const { indicator, fetchIndicatorAchievements, modulesManager } = this.props;
    fetchIndicatorAchievements(modulesManager, `indicator_Id: "${indicator.id}"`);
  }

  handleAdd = () => {
    this.setState({
      dialogOpen: true,
      editedAchievement: { indicator: this.props.indicator },
    });
  }

  handleEdit = (achievement) => {
    this.setState({
      dialogOpen: true,
      editedAchievement: achievement,
    });
  }

  handleDelete = (achievement) => {
    const { intl, coreConfirm } = this.props;
    this.setState({ toDelete: achievement });
    this.confirmedAction = this.confirmDelete;
    coreConfirm(
      formatMessage(intl, 'socialProtection', 'indicatorAchievement.delete.confirm.title'),
      formatMessageWithValues(intl, 'socialProtection', 'indicatorAchievement.delete.confirm.message', { date: achievement.date }),
    );
  }

  confirmDelete = () => {
    const { deleteIndicatorAchievement, intl } = this.props;
    deleteIndicatorAchievement(
      this.state.toDelete,
      formatMessage(intl, 'socialProtection', 'indicatorAchievement.delete.mutationLabel'),
    );
    this.props.clearConfirm();
  }

  handleDialogClose = (refreshData = false) => {
    this.setState({ dialogOpen: false, editedAchievement: null });
    if (refreshData) {
      this.refreshData();
    }
  }

  formatAchievement = (achievement) => ({
    id: achievement.id,
    date: achievement.date,
    achieved: achievement.achieved,
    comment: achievement.comment || '',
    actions: [
      {
        icon: <EditIcon />,
        tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.edit'),
        onClick: () => this.handleEdit(achievement),
      },
      {
        icon: <DeleteIcon />,
        tooltip: formatMessage(this.props.intl, 'socialProtection', 'tooltip.delete'),
        onClick: () => this.handleDelete(achievement),
      },
    ],
  });

  headers = () => [
    {
      id: 'date',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicatorAchievement.date'),
      sortable: true,
    },
    {
      id: 'achieved',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicatorAchievement.achieved'),
      sortable: true,
    },
    {
      id: 'comment',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicatorAchievement.comment'),
      sortable: false,
    },
    {
      id: 'actions',
      label: formatMessage(this.props.intl, 'socialProtection', 'indicators.actions'),
      sortable: false,
    },
  ];

  render() {
    const {
      classes, indicator, fetchingIndicatorAchievements, indicatorAchievements, rights, intl,
    } = this.props;
    const { dialogOpen, editedAchievement } = this.state;

    if (!indicator) return null;

    return (
      <Paper className={classes.paper}>
        <Grid container>
          <Grid item xs={12} className={classes.paperHeader}>
            <Typography variant="h6" className={classes.tableTitle}>
              {formatMessage(intl, 'socialProtection', 'indicatorAchievementsPanel.title')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={this.handleAdd}
            >
              {formatMessage(intl, 'socialProtection', 'indicatorAchievement.add')}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Searcher
              module="socialProtection"
              tableTitle={formatMessage(intl, 'socialProtection', 'indicatorAchievementsPanel.searcher.title')}
              items={indicatorAchievements || []}
              fetchingItems={fetchingIndicatorAchievements}
              itemsFormatter={this.formatAchievement}
              headers={this.headers}
              rights={rights}
              defaultOrderBy="date"
              defaultOrderByDirection="desc"
            />
          </Grid>
        </Grid>
        {dialogOpen && (
          <IndicatorAchievementDialog
            achievement={editedAchievement}
            onClose={this.handleDialogClose}
          />
        )}
      </Paper>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core?.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
  indicatorAchievements: state.socialProtection.indicatorAchievements,
  fetchingIndicatorAchievements: state.socialProtection.fetchingIndicatorAchievements,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchIndicatorAchievements,
  deleteIndicatorAchievement,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default injectIntl(
  withModulesManager(
    connect(mapStateToProps, mapDispatchToProps)(
      withTheme(withStyles(styles)(IndicatorAchievementsPanel))
    )
  )
);
