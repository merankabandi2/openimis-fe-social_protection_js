import React, { useState } from 'react';
import { injectIntl } from 'react-intl';

import { 
  Grid, 
  Paper, 
  Typography, 
  Box,
  Chip,
  Tooltip,
  InputAdornment,
  Button,
  Switch,
  FormControlLabel,
  Collapse
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import InfoIcon from '@material-ui/icons/Info';
import PersonIcon from '@material-ui/icons/Person';
import WcIcon from '@material-ui/icons/Wc';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ViewComfyIcon from '@material-ui/icons/ViewComfy';
import ViewListIcon from '@material-ui/icons/ViewList';

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
  // Simple view styles (default) - Modern UI/UX with reduced spacing
  simpleView: {
    backgroundColor: '#fafafa',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    border: '1px solid #e8e8e8',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    
    // Target both outlined and underlined inputs
    '& .MuiOutlinedInput-root, & .MuiInput-root': {
      border: '1px solid #d1d5db !important',
      borderRadius: '8px !important',
      backgroundColor: '#ffffff !important',
      transition: 'all 0.2s ease-in-out !important',
      '&:hover': {
        border: '1px solid #3b82f6 !important',
        backgroundColor: '#ffffff !important',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15) !important',
      },
      '&.Mui-focused': {
        border: '2px solid #3b82f6 !important',
        backgroundColor: '#ffffff !important',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1), 0 2px 8px rgba(59, 130, 246, 0.15) !important',
        transform: 'translateY(-1px)',
      },
      '&.Mui-error': {
        border: '1px solid #ef4444 !important',
        backgroundColor: '#fef2f2 !important',
        '&:hover': {
          border: '1px solid #ef4444 !important',
          backgroundColor: '#fef2f2 !important',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15) !important',
        },
        '&.Mui-focused': {
          border: '2px solid #ef4444 !important',
          backgroundColor: '#ffffff !important',
          boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.1), 0 2px 8px rgba(239, 68, 68, 0.15) !important',
        },
      },
    },
    
    // Hide default underlines and outlines since we're adding custom borders
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none !important',
    },
    '& .MuiInput-underline:before, & .MuiInput-underline:after': {
      display: 'none !important',
    },
    
    // Always visible labels - force shrink state
    '& .MuiInputLabel-root': {
      color: '#6b7280 !important',
      fontWeight: '500 !important',
      fontSize: '0.75rem !important',
      transform: 'translate(14px, -6px) scale(1) !important',
      transformOrigin: 'top left !important',
      background: 'transparent !important',
      padding: '0 4px !important',
      '&.Mui-focused': {
        color: '#3b82f6 !important',
        fontWeight: '600 !important',
      },
      '&.Mui-error': {
        color: '#ef4444 !important',
        fontWeight: '600 !important',
      },
    },
    
    // Override any auto-shrinking behavior
    '& .MuiInputLabel-outlined': {
      transform: 'translate(14px, -6px) scale(1) !important',
      background: 'linear-gradient(to bottom, transparent 40%, #fafafa 40%, #fafafa 60%, transparent 60%) !important',
    },
    
    // Helper text styling
    '& .MuiFormHelperText-root': {
      fontSize: '0.6875rem !important',
      marginTop: '2px !important',
      marginLeft: '2px !important',
      '&.Mui-error': {
        color: '#ef4444 !important',
        fontWeight: '500 !important',
      },
    },
    
    // Input text styling with adjusted padding for visible labels
    '& .MuiInputBase-input': {
      padding: '18px 14px 10px 14px !important',
      fontSize: '0.875rem !important',
      fontWeight: '500 !important',
      color: '#1f2937 !important',
      '&::placeholder': {
        color: '#9ca3af !important',
        opacity: 1,
      },
    },
  },
  
  // Section headers styling with reduced spacing
  sectionHeader: {
    color: '#374151',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    '&::before': {
      content: '""',
      width: '3px',
      height: '16px',
      backgroundColor: '#3b82f6',
      borderRadius: '2px',
    },
  },
  
  // Reduced field container spacing
  fieldContainer: {
    marginBottom: theme.spacing(1.5),
  },
  compactField: {
    marginBottom: theme.spacing(1),
  },
  inlineFields: {
    display: 'flex',
    gap: theme.spacing(1),
    '& > *': {
      flex: 1,
    },
  },
  // Detailed view styles
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
  // Common styles
  validationError: {
    '& .MuiOutlinedInput-root': {
      borderColor: theme.palette.error.main,
    },
  },
  validationSuccess: {
    '& .MuiOutlinedInput-root': {
      borderColor: theme.palette.success.main,
    },
  },
  viewToggle: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickSummary: {
    padding: theme.spacing(1.5),
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-around',
    gap: theme.spacing(1.5),
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    '& > *': {
      textAlign: 'center',
      flex: 1,
      padding: theme.spacing(0.75),
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      border: '1px solid #f1f5f9',
    },
  },
});

const isEmptyObject = (obj) => Object.keys(obj).length === 0;

class MonetaryTransferHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      detailedView: false, // Start with simple view
    };
  }

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

  toggleView = () => {
    this.setState(prevState => ({
      detailedView: !prevState.detailedView
    }));
  };

  renderSimpleView = () => {
    const { edited, classes, readOnly, intl } = this.props;
    const monetaryTransfer = { ...edited };

    // Validation states
    const womenValid = this.validatePaidVsPlanned(monetaryTransfer?.paidWomen, monetaryTransfer?.plannedWomen);
    const menValid = this.validatePaidVsPlanned(monetaryTransfer?.paidMen, monetaryTransfer?.plannedMen);
    const twaValid = this.validatePaidVsPlanned(monetaryTransfer?.paidTwa, monetaryTransfer?.plannedTwa);
    const amountValid = this.validateAmountVsPlanned(monetaryTransfer?.transferredAmount, monetaryTransfer?.plannedAmount);

    return (
      <div className={classes.simpleView}>
        <Grid container spacing={2}>
          {/* Row 1: Basic Information */}
          <Grid item xs={12}>
            <div className={classes.sectionHeader}>
              Informations de base
            </div>
          </Grid>
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
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
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
            <PublishedComponent
              readOnly={readOnly}
              pubRef="core.DatePicker"
              required
              value={monetaryTransfer?.transferDate}
              onChange={(transferDate) => this.updateAttribute('transferDate', transferDate)}
              label={formatMessage(intl, 'social_protection', 'monetaryTransfer.transferDate')}
            />
          </Grid>
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
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
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
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

          {/* Row 2: Beneficiaries - Full width layout for better data entry */}
          <Grid item xs={12} style={{ marginTop: 12 }}>
            <div className={classes.sectionHeader}>
              Bénéficiaires
            </div>
          </Grid>
          
          {/* Planned beneficiaries in full-width grid */}
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="plannedWomen"
              onChange={(v) => this.updateAttribute('plannedWomen', v)}
              value={monetaryTransfer?.plannedWomen ?? ''}
              readOnly={readOnly}
              required
              min={0}
            />
          </Grid>
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="plannedMen"
              onChange={(v) => this.updateAttribute('plannedMen', v)}
              value={monetaryTransfer?.plannedMen ?? ''}
              readOnly={readOnly}
              required
              min={0}
            />
          </Grid>
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="plannedTwa"
              onChange={(v) => this.updateAttribute('plannedTwa', v)}
              value={monetaryTransfer?.plannedTwa ?? ''}
              readOnly={readOnly}
              required
              min={0}
            />
          </Grid>
          
          {/* Paid beneficiaries in full-width grid */}
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="paidWomen"
              onChange={(v) => this.updateAttribute('paidWomen', v)}
              value={monetaryTransfer?.paidWomen ?? ''}
              readOnly={readOnly}
              required
              min={0}
              error={!womenValid}
              helperText={!womenValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
            />
          </Grid>
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="paidMen"
              onChange={(v) => this.updateAttribute('paidMen', v)}
              value={monetaryTransfer?.paidMen ?? ''}
              readOnly={readOnly}
              required
              min={0}
              error={!menValid}
              helperText={!menValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
            />
          </Grid>
          <Grid item xs={12} md={4} className={classes.fieldContainer}>
            <NumberInput
              module="socialProtection"
              label="paidTwa"
              onChange={(v) => this.updateAttribute('paidTwa', v)}
              value={monetaryTransfer?.paidTwa ?? ''}
              readOnly={readOnly}
              required
              min={0}
              error={!twaValid}
              helperText={!twaValid ? 'Ne peut pas dépasser le nombre prévu' : ''}
            />
          </Grid>

          {/* Row 3: Amounts */}
          <Grid item xs={12} style={{ marginTop: 12 }}>
            <div className={classes.sectionHeader}>
              Montants (BIF)
            </div>
          </Grid>
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
            <AmountInput
              module="socialProtection"
              label="plannedAmount"
              onChange={(v) => this.updateAttribute('plannedAmount', v)}
              value={monetaryTransfer?.plannedAmount ?? ''}
              readOnly={readOnly}
              required
              displayZero
            />
          </Grid>
          <Grid item xs={12} md={6} className={classes.fieldContainer}>
            <AmountInput
              module="socialProtection"
              label="transferredAmount"
              onChange={(v) => this.updateAttribute('transferredAmount', v)}
              value={monetaryTransfer?.transferredAmount ?? ''}
              readOnly={readOnly}
              required
              displayZero
              error={!amountValid}
              helperText={!amountValid ? 'Ne peut pas dépasser le montant prévu' : ''}
            />
          </Grid>

          {/* Quick Summary */}
          {(this.getTotalPlanned(monetaryTransfer) > 0 || monetaryTransfer?.plannedAmount) && (
            <Grid item xs={12}>
              <div className={classes.quickSummary}>
                <div>
                  <Typography variant="caption" color="textSecondary">Total Prévu</Typography>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {this.getTotalPlanned(monetaryTransfer)} bénéf.
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">Total Payé</Typography>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {this.getTotalPaid(monetaryTransfer)} bénéf.
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">Montant Prévu</Typography>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {this.formatCurrency(monetaryTransfer?.plannedAmount)} BIF
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="textSecondary">Montant Transféré</Typography>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    {this.formatCurrency(monetaryTransfer?.transferredAmount)} BIF
                  </Typography>
                </div>
              </div>
            </Grid>
          )}
        </Grid>
      </div>
    );
  };

  renderDetailedView = () => {
    const { edited, classes, readOnly, intl } = this.props;
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
  };

  render() {
    const { classes } = this.props;
    const { detailedView } = this.state;

    return (
      <div>
        {/* View Toggle */}
        <div className={classes.viewToggle}>
          <Typography variant="h6">
            Transfert Monétaire
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={detailedView}
                onChange={this.toggleView}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                {detailedView ? <ViewComfyIcon /> : <ViewListIcon />}
                {detailedView ? 'Vue détaillée' : 'Vue simple'}
              </Box>
            }
          />
        </div>

        {/* Render appropriate view */}
        {detailedView ? this.renderDetailedView() : this.renderSimpleView()}
      </div>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MonetaryTransferHeadPanel))));
