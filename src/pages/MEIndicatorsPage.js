import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import {
  Helmet,
  Form,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  MODULE_NAME,
} from '../constants';
import MEIndicatorsHeadPanel from '../components/me/MEIndicatorsHeadPanel';
import MEIndicatorstTab from '../components/me/MEIndicatorsTab';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  fab: theme.fab,
}));

function MEIndicatorsPage({
  rights,
  confirmed,
  submittingMutation,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);

  const [readOnly] = useState(false);
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();

  useEffect(() => {
    if (confirmed && typeof confirmed === 'function') confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const actions = [];

  return (
    <div className={classes.page}>
      <Helmet title={formatMessage('me.indicator.page.title')} />
      <Form
        key="payments-requests"
        module="payroll"
        title={formatMessage('me.indicator.title')}
        HeadPanel={MEIndicatorsHeadPanel}
        Panels={[MEIndicatorstTab]}
        rights={rights}
        actions={actions}
        setConfirmedAction={setConfirmedAction}
        readOnly={readOnly}
      />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.payroll.submittingMutation,
  mutation: state.payroll.mutation,
});

export default connect(mapStateToProps, mapDispatchToProps)(MEIndicatorsPage);
