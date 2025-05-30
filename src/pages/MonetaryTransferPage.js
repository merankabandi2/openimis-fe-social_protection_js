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
  clearMonetaryTransfer,
  createMonetaryTransfer,
  deleteMonetaryTransfer,
  fetchMonetaryTransfer,
  updateMonetaryTransfer,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_MONETARY_TRANSFER_UPDATE,
} from '../constants';
import { ACTION_TYPE } from '../reducer';
import { mutationLabel, pageTitle } from '../util/string-utils';
import MonetaryTransferHeadPanel from '../components/me/MonetaryTransferHeadPanel';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
}));

function MonetaryTransferPage({
  clearMonetaryTransfer,
  createMonetaryTransfer,
  deleteMonetaryTransfer,
  updateMonetaryTransfer,
  monetaryTransferUuid,
  fetchMonetaryTransfer,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  monetaryTransfer,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editedMonetaryTransfer, setEditedMonetaryTransfer] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();
  const pageLocked = editedMonetaryTransfer?.isDeleted;

  const back = () => history.goBack();

  useEffect(() => {
    if (monetaryTransferUuid) {
      fetchMonetaryTransfer(modulesManager, [`id: "${monetaryTransferUuid}"`]);
    }
  }, [monetaryTransferUuid]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_MONETARY_TRANSFER) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedMonetaryTransfer(monetaryTransfer), [monetaryTransfer]);

  useEffect(() => () => clearMonetaryTransfer(), []);

  const mandatoryFieldsEmpty = () => {
    if (
      editedMonetaryTransfer?.transferDate
      && editedMonetaryTransfer?.location
      && editedMonetaryTransfer?.programme
      && editedMonetaryTransfer?.paymentAgency
      && editedMonetaryTransfer?.plannedAmount !== undefined
      && editedMonetaryTransfer?.plannedAmount !== null
      && editedMonetaryTransfer?.transferredAmount !== undefined
      && editedMonetaryTransfer?.transferredAmount !== null
      && !editedMonetaryTransfer?.isDeleted) return false;
    return true;
  };

  const hasValidationErrors = () => {
    const paidWomen = Number(editedMonetaryTransfer?.paidWomen || 0);
    const plannedWomen = Number(editedMonetaryTransfer?.plannedWomen || 0);
    const paidMen = Number(editedMonetaryTransfer?.paidMen || 0);
    const plannedMen = Number(editedMonetaryTransfer?.plannedMen || 0);
    const paidTwa = Number(editedMonetaryTransfer?.paidTwa || 0);
    const plannedTwa = Number(editedMonetaryTransfer?.plannedTwa || 0);
    const transferredAmount = Number(editedMonetaryTransfer?.transferredAmount || 0);
    const plannedAmount = Number(editedMonetaryTransfer?.plannedAmount || 0);

    return (
      paidWomen > plannedWomen ||
      paidMen > plannedMen ||
      paidTwa > plannedTwa ||
      transferredAmount > plannedAmount
    );
  };

  const canSave = () => !mandatoryFieldsEmpty() && !hasValidationErrors();

  const handleSave = () => {
    if (monetaryTransfer?.id) {
      updateMonetaryTransfer(
        editedMonetaryTransfer,
        formatMessageWithValues('monetaryTransfer.mutation.updateLabel', mutationLabel(monetaryTransfer)),
      );
    } else {
      createMonetaryTransfer(
        editedMonetaryTransfer,
        formatMessageWithValues('monetaryTransfer.mutation.createLabel', mutationLabel(monetaryTransfer)),
      );
    }
    back();
  };

  const deleteMonetaryTransferCallback = () => deleteMonetaryTransfer(
    monetaryTransfer,
    formatMessageWithValues('monetaryTransfer.mutation.deleteLabel', mutationLabel(monetaryTransfer)),
  );

  const openDeleteMonetaryTransferConfirmDialog = () => {
    setConfirmedAction(() => deleteMonetaryTransferCallback);
    coreConfirm(
      formatMessageWithValues('monetaryTransfer.delete.confirm.title', pageTitle(monetaryTransfer)),
      formatMessage('monetaryTransfer.delete.confirm.message'),
    );
  };

  const actions = [
    !!monetaryTransferUuid && !pageLocked && {
      doIt: openDeleteMonetaryTransferConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('tooltip.delete'),
    },
  ];

  return (
    rights.includes(RIGHT_MONETARY_TRANSFER_UPDATE) && (
    <div className={pageLocked ? classes.lockedPage : null}>
      <div className={classes.page}>
        <Form
          module="payroll"
          title={formatMessageWithValues('MonetaryTransferPage.title', pageTitle(monetaryTransfer))}
          titleParams={pageTitle(monetaryTransfer)}
          openDirty
          edited={editedMonetaryTransfer}
          onEditedChanged={setEditedMonetaryTransfer}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={MonetaryTransferHeadPanel}
          readOnly={pageLocked}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage('tooltip.save')}
        />
      </div>
    </div>
    )
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  clearMonetaryTransfer,
  createMonetaryTransfer,
  deleteMonetaryTransfer,
  updateMonetaryTransfer,
  fetchMonetaryTransfer,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  monetaryTransferUuid: props.match.params.monetary_transfer_uuid,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
  monetaryTransfer: state.socialProtection.monetaryTransfer,
});

export default connect(mapStateToProps, mapDispatchToProps)(MonetaryTransferPage);
