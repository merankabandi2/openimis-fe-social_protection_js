import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  PublishedComponent,
  formatMessage,
  TextInput,
} from '@openimis/fe-core';

import { BENEFIT_PLAN_TYPE } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

class MonetaryTransferHeadPanel extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
    } = this.props;
    const monetaryTransfer = { ...edited };
    return (
      <Grid container className={classes.item}>
        <Grid xs={12}>
          <PublishedComponent
            pubRef="location.CommuneLocation"
            withNull
            required
            readOnly={readOnly}
            filterLabels={false}
            value={monetaryTransfer?.location}
            onChange={(locations) => this.updateAttribute('location', locations)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="socialProtection.BenefitPlanPicker"
            value={
              monetaryTransfer.programme && !isEmptyObject(monetaryTransfer.programme)
                ? monetaryTransfer.programme
                : null
            }
            readOnly={readOnly}
            label={formatMessage(intl, 'paymentPlan', 'benefitPlan')}
            required
            onChange={(programme) => this.updateAttribute('programme', programme)}
            type={BENEFIT_PLAN_TYPE.GROUP}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <PublishedComponent
            pubRef="payroll.PaymentPointPicker"
            required
            withNull={false}
            readOnly={readOnly}
            value={!!monetaryTransfer?.paymentAgency && monetaryTransfer.paymentAgency}
            onChange={(paymentAgency) => this.updateAttribute('paymentAgency', paymentAgency)}
            label={formatMessage(intl, 'payroll', 'paymentPoint')}
          />
        </Grid>
        <Grid xs={3} className={classes.item}>
          <PublishedComponent
            readOnly={readOnly}
            pubRef="core.DatePicker"
            required
            value={monetaryTransfer?.transferDate}
            onChange={(transferDate) => this.updateAttribute('transferDate', transferDate)}
            label={formatMessage(intl, 'social_protection', 'monetaryTransfer.transferDate')}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="plannedWomen"
            onChange={(v) => this.updateAttribute('plannedWomen', v)}
            value={monetaryTransfer?.plannedWomen ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="plannedMen"
            onChange={(v) => this.updateAttribute('plannedMen', v)}
            value={monetaryTransfer?.plannedMen ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="plannedTwa"
            onChange={(v) => this.updateAttribute('plannedTwa', v)}
            value={monetaryTransfer?.plannedTwa ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="paidWomen"
            onChange={(v) => this.updateAttribute('paidWomen', v)}
            value={monetaryTransfer?.paidWomen ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="paidMen"
            onChange={(v) => this.updateAttribute('paidMen', v)}
            value={monetaryTransfer?.paidMen ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="paidTwa"
            onChange={(v) => this.updateAttribute('paidTwa', v)}
            value={monetaryTransfer?.paidTwa ?? ''}
            readOnly={readOnly}
            required
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MonetaryTransferHeadPanel))));
