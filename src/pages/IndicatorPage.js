import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  clearIndicator,
  createIndicator,
  deleteIndicator,
  fetchIndicator,
  updateIndicator,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_INDICATOR_CREATE,
  RIGHT_INDICATOR_UPDATE,
} from '../constants';
import { ACTION_TYPE } from '../reducer';
import { mutationLabel, pageTitle } from '../util/string-utils';
import IndicatorForm from '../components/indicators/IndicatorForm';
import IndicatorAchievementsPanel from '../components/indicators/IndicatorAchievementsPanel';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
}));

function IndicatorPage({
  clearIndicator,
  createIndicator,
  deleteIndicator,
  updateIndicator,
  indicatorId,
  fetchIndicator,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  indicator,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editedIndicator, setEditedIndicator] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();
  const pageLocked = editedIndicator?.isDeleted;

  const back = () => history.goBack();

  useEffect(() => {
    if (indicatorId) {
      fetchIndicator(modulesManager, [`id: "${indicatorId}"`]);
    }
  }, [indicatorId]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_INDICATOR) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedIndicator(indicator), [indicator]);

  useEffect(() => () => clearIndicator(), []);

  const mandatoryFieldsEmpty = () => {
    if (
      editedIndicator?.name
      && !editedIndicator?.isDeleted) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty();

  const handleSave = () => {
    if (indicator?.id) {
      updateIndicator(
        editedIndicator,
        formatMessageWithValues('indicator.mutation.updateLabel', mutationLabel(indicator)),
      );
    } else {
      createIndicator(
        editedIndicator,
        formatMessageWithValues('indicator.mutation.createLabel', mutationLabel(indicator)),
      );
    }
    back();
  };

  const deleteIndicatorCallback = () => deleteIndicator(
    indicator,
    formatMessageWithValues('indicator.mutation.deleteLabel', mutationLabel(indicator)),
  );

  const openDeleteIndicatorConfirmDialog = () => {
    setConfirmedAction(() => deleteIndicatorCallback);
    coreConfirm(
      formatMessageWithValues('indicator.delete.confirm.title', pageTitle(indicator)),
      formatMessage('indicator.delete.confirm.message'),
    );
  };

  const actions = [
    !!indicatorId && !pageLocked && {
      doIt: openDeleteIndicatorConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('tooltip.delete'),
    },
  ];

  const canViewPage = indicatorId 
    ? rights.includes(RIGHT_INDICATOR_UPDATE) 
    : rights.includes(RIGHT_INDICATOR_CREATE);

  if (!canViewPage) {
    return (
      <div className={classes.page}>
        <h3>You don't have permission to {indicatorId ? 'edit' : 'create'} indicators</h3>
        <p>Required right: {indicatorId ? RIGHT_INDICATOR_UPDATE : RIGHT_INDICATOR_CREATE}</p>
        <p>Your rights: {rights.join(', ')}</p>
      </div>
    );
  }

  return (
    <div className={pageLocked ? classes.lockedPage : null}>
      <div className={classes.page}>
        <Form
          module="socialProtection"
          title={indicatorId ? formatMessage('indicator.page.editTitle') : formatMessage('indicator.page.createTitle')}
          titleParams={pageTitle(indicator)}
          openDirty
          edited={editedIndicator}
          onEditedChanged={setEditedIndicator}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={IndicatorForm}
          readOnly={pageLocked}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage('tooltip.save')}
        />
        {indicator?.id && (
          <IndicatorAchievementsPanel indicator={indicator} />
        )}
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  clearIndicator,
  createIndicator,
  deleteIndicator,
  updateIndicator,
  fetchIndicator,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  indicatorId: props.match.params.indicator_id,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
  indicator: state.socialProtection.indicator,
});

export default connect(mapStateToProps, mapDispatchToProps)(IndicatorPage);
