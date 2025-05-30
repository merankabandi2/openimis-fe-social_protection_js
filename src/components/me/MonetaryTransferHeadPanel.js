import React from 'react';
import { injectIntl } from 'react-intl';

import { 
  Grid, 
  Paper, 
  Typography, 
  Divider, 
  Box,
  Chip,
  Tooltip,
  InputAdornment 
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import PersonIcon from '@material-ui/icons/Person';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';

import {
  FormPanel,
  withModulesManager,
  PublishedComponent,
  formatMessage,
  TextInput,
  NumberInput,
  AmountInput,
} from '@openimis/fe-core';

import { BENEFIT_PLAN_TYPE } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
  sectionPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  summaryBox: {
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
    border: '1px solid #e0e0e0',
    marginTop: theme.spacing(1),
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  validationError: {
    borderColor: theme.palette.error.main,
    '& .MuiOutlinedInput-root': {
      borderColor: theme.palette.error.main,
    },
  },
  validationSuccess: {
    borderColor: theme.palette.success.main,
    '& .MuiOutlinedInput-root': {
      borderColor: theme.palette.success.main,
    },
  },
  fieldWithIcon: {
    '& .MuiInputBase-root': {
      paddingLeft: theme.spacing(1),
    },
  },
});

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

class MonetaryTransferHeadPanel extends FormPanel {
  // Helper function to format currency
  formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    return Number(amount).toLocaleString('fr-FR');
  };

  // Validation helpers
  validatePaidVsPlanned = (paid, planned) => {
    const paidNum = Number(paid || 0);
    const plannedNum = Number(planned || 0);
    return paidNum <= plannedNum;
  };

  validateAmountVsPlanned = (transferred, planned) => {
    const transferredNum = Number(transferred || 0);
    const plannedNum = Number(planned || 0);
    return transferredNum <= plannedNum;
  };

  // Calculate totals
  getTotalPlanned = (monetaryTransfer) => {
    return (Number(monetaryTransfer?.plannedWomen || 0) + 
            Number(monetaryTransfer?.plannedMen || 0) + 
            Number(monetaryTransfer?.plannedTwa || 0));
  };

  getTotalPaid = (monetaryTransfer) => {
    return (Number(monetaryTransfer?.paidWomen || 0) + 
            Number(monetaryTransfer?.paidMen || 0) + 
            Number(monetaryTransfer?.paidTwa || 0));
  };

  getPaymentRate = (monetaryTransfer) => {
    const totalPlanned = this.getTotalPlanned(monetaryTransfer);
    const totalPaid = this.getTotalPaid(monetaryTransfer);
    return totalPlanned > 0 ? Math.round((totalPaid / totalPlanned) * 100) : 0;
  };

  getTransferRate = (monetaryTransfer) => {
    const plannedAmount = Number(monetaryTransfer?.plannedAmount || 0);
    const transferredAmount = Number(monetaryTransfer?.transferredAmount || 0);
    return plannedAmount > 0 ? Math.round((transferredAmount / plannedAmount) * 100) : 0;
  };

  render() {
    const {
      edited,
      classes,
      readOnly,
      intl,
    } = this.props;
    const monetaryTransfer = { ...edited };

    // Validation states
    const womenValid = this.validatePaidVsPlanned(monetaryTransfer?.paidWomen, monetaryTransfer?.plannedWomen);
    const menValid = this.validatePaidVsPlanned(monetaryTransfer?.paidMen, monetaryTransfer?.plannedMen);
    const twaValid = this.validatePaidVsPlanned(monetaryTransfer?.paidTwa, monetaryTransfer?.plannedTwa);
    const amountValid = this.validateAmountVsPlanned(monetaryTransfer?.transferredAmount, monetaryTransfer?.plannedAmount);

    // Calculate summaries
    const totalPlanned = this.getTotalPlanned(monetaryTransfer);
    const totalPaid = this.getTotalPaid(monetaryTransfer);
    const paymentRate = this.getPaymentRate(monetaryTransfer);
    const transferRate = this.getTransferRate(monetaryTransfer);

    return (
      <Grid container spacing={3}>
        {/* Basic Information Section */}
        <Grid item xs={12}>
          <Paper className={classes.sectionPaper}>
            <Typography className={classes.sectionTitle}>
              <InfoIcon />
              Informations de base
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  readOnly={readOnly}
                  pubRef="core.DatePicker"
                  required
                  value={monetaryTransfer?.transferDate}
                  onChange={(transferDate) => this.updateAttribute('transferDate', transferDate)}
                  label={formatMessage(intl, 'social_protection', 'monetaryTransfer.transferDate')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
            </Grid>
          </Paper>
        </Grid>

        {/* Planned Beneficiaries Section */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.sectionPaper}>
            <Typography className={classes.sectionTitle}>
              <PersonIcon />
              Bénéficiaires prévus
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="plannedWomen"
                  onChange={(v) => this.updateAttribute('plannedWomen', v)}
                  value={monetaryTransfer?.plannedWomen ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WcIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="plannedMen"
                  onChange={(v) => this.updateAttribute('plannedMen', v)}
                  value={monetaryTransfer?.plannedMen ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="plannedTwa"
                  onChange={(v) => this.updateAttribute('plannedTwa', v)}
                  value={monetaryTransfer?.plannedTwa ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessibilityIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box className={classes.summaryBox}>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Total prévu:</Typography>
                <Chip 
                  label={`${totalPlanned} bénéficiaires`} 
                  color="primary" 
                  variant="outlined" 
                  size="small"
                />
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Paid Beneficiaries Section */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.sectionPaper}>
            <Typography className={classes.sectionTitle}>
              <PersonIcon />
              Bénéficiaires payés
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="paidWomen"
                  onChange={(v) => this.updateAttribute('paidWomen', v)}
                  value={monetaryTransfer?.paidWomen ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  className={!womenValid ? classes.validationError : classes.validationSuccess}
                  error={!womenValid}
                  helperText={!womenValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WcIcon color={womenValid ? "action" : "error"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="paidMen"
                  onChange={(v) => this.updateAttribute('paidMen', v)}
                  value={monetaryTransfer?.paidMen ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  className={!menValid ? classes.validationError : classes.validationSuccess}
                  error={!menValid}
                  helperText={!menValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color={menValid ? "action" : "error"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <PublishedComponent
                  pubRef="core.NumberInput"
                  module="socialProtection"
                  label="paidTwa"
                  onChange={(v) => this.updateAttribute('paidTwa', v)}
                  value={monetaryTransfer?.paidTwa ?? ''}
                  readOnly={readOnly}
                  required
                  min={0}
                  className={!twaValid ? classes.validationError : classes.validationSuccess}
                  error={!twaValid}
                  helperText={!twaValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessibilityIcon color={twaValid ? "action" : "error"} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box className={classes.summaryBox}>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Total payé:</Typography>
                <Chip 
                  label={`${totalPaid} bénéficiaires`} 
                  color={totalPaid <= totalPlanned ? "primary" : "secondary"} 
                  variant="outlined" 
                  size="small"
                />
              </div>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Taux de paiement:</Typography>
                <Chip 
                  label={`${paymentRate}%`} 
                  color={paymentRate >= 90 ? "primary" : paymentRate >= 70 ? "default" : "secondary"} 
                  size="small"
                />
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Amount Section */}
        <Grid item xs={12}>
          <Paper className={classes.sectionPaper}>
            <Typography className={classes.sectionTitle}>
              <AttachMoneyIcon />
              Montants financiers
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="core.AmountInput"
                  module="socialProtection"
                  label="plannedAmount"
                  onChange={(v) => this.updateAttribute('plannedAmount', v)}
                  value={monetaryTransfer?.plannedAmount ?? ''}
                  readOnly={readOnly}
                  required
                  displayZero
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        BIF
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <PublishedComponent
                  pubRef="core.AmountInput"
                  module="socialProtection"
                  label="transferredAmount"
                  onChange={(v) => this.updateAttribute('transferredAmount', v)}
                  value={monetaryTransfer?.transferredAmount ?? ''}
                  readOnly={readOnly}
                  required
                  displayZero
                  className={!amountValid ? classes.validationError : classes.validationSuccess}
                  error={!amountValid}
                  helperText={!amountValid ? 'Ne peut pas dépasser le montant prévu' : ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon color={amountValid ? "action" : "error"} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        BIF
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box className={classes.summaryBox}>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Montant prévu:</Typography>
                <Typography variant="body2" color="primary">
                  {this.formatCurrency(monetaryTransfer?.plannedAmount)} BIF
                </Typography>
              </div>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Montant transféré:</Typography>
                <Typography variant="body2" color={amountValid ? "primary" : "error"}>
                  {this.formatCurrency(monetaryTransfer?.transferredAmount)} BIF
                </Typography>
              </div>
              <div className={classes.summaryItem}>
                <Typography variant="body2" fontWeight="medium">Taux de transfert:</Typography>
                <Chip 
                  label={`${transferRate}%`} 
                  color={transferRate >= 90 ? "primary" : transferRate >= 70 ? "default" : "secondary"} 
                  size="small"
                />
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Overall Summary */}
        {(totalPlanned > 0 || monetaryTransfer?.plannedAmount) && (
          <Grid item xs={12}>
            <Paper style={{ padding: 16, backgroundColor: '#e8f5e8' }}>
              <Typography variant="h6" style={{ marginBottom: 8, color: '#2e7d32' }}>
                Résumé du transfert
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">{totalPlanned}</Typography>
                    <Typography variant="caption">Bénéficiaires prévus</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={totalPaid <= totalPlanned ? "primary" : "error"}>
                      {totalPaid}
                    </Typography>
                    <Typography variant="caption">Bénéficiaires payés</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {this.formatCurrency(monetaryTransfer?.plannedAmount)}
                    </Typography>
                    <Typography variant="caption">BIF prévus</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={amountValid ? "primary" : "error"}>
                      {this.formatCurrency(monetaryTransfer?.transferredAmount)}
                    </Typography>
                    <Typography variant="caption">BIF transférés</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MonetaryTransferHeadPanel))));
