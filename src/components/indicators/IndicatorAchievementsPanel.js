import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  Grid, Paper, Typography, Divider, Button, IconButton, Tooltip
} from '@material-ui/core';
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
import { ACTION_TYPE } from '../../reducer';

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  paperHeader: theme.paper.header,
});

class IndicatorAchievementsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpen: false,
      editedAchievement: null,
    };
  }

  componentDidMount() {
    const { indicator, fetchIndicatorAchievements } = this.props;
    if (indicator?.id) {
      fetchIndicatorAchievements(`indicator_Id: "${indicator.id}"`);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      confirmed, submittingMutation, mutation, indicator, journalize,
    } = this.props;

    if (prevProps.confirmed !== confirmed && confirmed) {
      this.confirmedAction();
    }

    if (prevProps.submittingMutation && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.CREATE_INDICATOR_ACHIEVEMENT
          || mutation?.actionType === ACTION_TYPE.UPDATE_INDICATOR_ACHIEVEMENT
          || mutation?.actionType === ACTION_TYPE.DELETE_INDICATOR_ACHIEVEMENT) {
        this.refreshData();
      }
    }

    if (prevProps.indicator?.id !== indicator?.id && indicator?.id) {
      this.refreshData();
    }
  }

  refreshData = () => {
    const { indicator, fetchIndicatorAchievements } = this.props;
    if (indicator?.id) {
      fetchIndicatorAchievements(`indicator_Id: "${indicator.id}"`);
    }
  };

  handleAdd = () => {
    const { indicator } = this.props;
    this.setState({
      dialogOpen: true,
      editedAchievement: { indicator },
    });
  };

  handleEdit = (achievement) => {
    this.setState({
      dialogOpen: true,
      editedAchievement: achievement,
    });
  };

  handleDelete = (achievement) => {
    const { intl, coreConfirm } = this.props;
    this.setState({ toDelete: achievement });
    this.confirmedAction = this.confirmDelete;
    coreConfirm(
      formatMessage(intl, 'socialProtection', 'indicatorAchievement.delete.confirm.title'),
      formatMessageWithValues(
        intl,
        'socialProtection',
        'indicatorAchievement.delete.confirm.message',
        { date: achievement.date },
      ),
    );
  };

  confirmDelete = () => {
    const { deleteIndicatorAchievement, intl, clearConfirm } = this.props;
    const { toDelete } = this.state;
    deleteIndicatorAchievement(
      toDelete,
      formatMessage(intl, 'socialProtection', 'indicatorAchievement.delete.mutationLabel'),
    );
    clearConfirm();
  };

  handleDialogClose = (refreshData = false) => {
    this.setState({ dialogOpen: false, editedAchievement: null });
    if (refreshData) {
      this.refreshData();
    }
  };

  itemFormatters = () => [
    (achievement) => achievement.date,
    (achievement) => achievement.achieved,
    (achievement) => achievement.comment,
    (achievement) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton
            onClick={() => this.handleEdit(achievement)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={formatMessage('tooltip.delete')}>
          <IconButton
            onClick={() => this.handleDelete(achievement)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
    ),
  ];

  headers = () => {
    const { intl } = this.props;
    return [
      {
        id: 'date',
        label: formatMessage(intl, 'socialProtection', 'indicatorAchievement.date'),
        sortable: true,
      },
      {
        id: 'achieved',
        label: formatMessage(intl, 'socialProtection', 'indicatorAchievement.achieved'),
        sortable: true,
      },
      {
        id: 'comment',
        label: formatMessage(intl, 'socialProtection', 'indicatorAchievement.comment'),
        sortable: false,
      },
      {
        id: 'actions',
        label: formatMessage(intl, 'socialProtection', 'indicators.actions'),
        sortable: false,
      },
    ];
  };

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
              itemFormatters={this.itemFormatters}
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

IndicatorAchievementsPanel.defaultProps = {
  indicator: null,
  rights: [],
  confirmed: false,
  submittingMutation: false,
  mutation: null,
  indicatorAchievements: [],
  fetchingIndicatorAchievements: false,
};

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
      withTheme(withStyles(styles)(IndicatorAchievementsPanel)),
    ),
  ),
);
