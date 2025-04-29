import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {
  useModulesManager,
  useTranslations,
  PublishedComponent,
  useHistory,
  coreAlert,
} from '@openimis/fe-core';
import {
  Paper,
  Grid,
  CircularProgress,
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import { DatePicker } from '@material-ui/pickers';
import { generateProvincePayroll } from '../../actions';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
  datePicker: {
    width: '100%',
  },
  loadingWrapper: {
    position: 'relative',
    textAlign: 'center',
    padding: '20px',
  },
}));

function GeneratePayrollDialog({
  location,
  buttonLabel,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const history = useHistory();
  const dispatch = useDispatch();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);
  const [isOpen, setIsOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentPlan, setPaymentPlan] = useState();
  const [generating, setGenerating] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleGenerate = () => {
    if (!location?.id || !location?.benefitPlanId) {
      coreAlert(formatMessage('payroll.missingData'), formatMessage('error'));
      return;
    }

    setGenerating(true);

    // Format date to YYYY-MM-DD for GraphQL
    const formattedDate = paymentDate.toISOString().split('T')[0];

    const paymentPlanId = paymentPlan.id;
    
    // Prepare params for mutation
    const params = {
      provinceId: location.id,
      paymentPlanId,
      paymentDate: formattedDate,
    };

    // Call mutation
    dispatch(generateProvincePayroll(
      params,
      'generate_province_payroll'
    ))
      .then((result) => {
        setGenerating(false);
        
        if (!result) {
          coreAlert(formatMessage('payroll.generationError'), formatMessage('error'));
          return;
        }

        const mutationResult = result.payload?.data?.generateProvincePayroll;
        
        if (mutationResult?.success) {
          // Show success message
          coreAlert(formatMessage('payroll.generationSuccess', { count: mutationResult.totalPayrolls }), formatMessage('success'));
          
          // Navigate to payroll list if needed
          const payrollRouteRef = modulesManager.getRef('payroll.route.payrolls');
          history.push(`/${payrollRouteRef}`);
        } else {
          // Show error message
          coreAlert(mutationResult?.error || formatMessage('payroll.generationError'), formatMessage('error'));
        }

        handleClose();
      })
      .catch((error) => {
        setGenerating(false);
        console.error(error);
        coreAlert(formatMessage('payroll.generationError'), formatMessage('error'));
      });
  };

  return (
    <>
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          handleOpen();
        }}
      >
        {buttonLabel || formatMessage('payroll.generate')}
      </a>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        PaperProps={{
          style: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '50%',
            maxWidth: '600px',
          },
        }}
      >
        <DialogTitle>
          {formatMessage('payroll.generateForLocation')}
        </DialogTitle>
        <DialogContent>
          {generating ? (
            <div className={classes.loadingWrapper}>
              <CircularProgress />
              <Typography variant="body1" style={{ marginTop: '10px' }}>
                {formatMessage('payroll.generating')}
              </Typography>
            </div>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                  <Typography variant="h6" gutterBottom>
                    {formatMessage('location.details')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>{formatMessage('location.name')}:</strong> {location.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>{formatMessage('location.code')}:</strong> {location.code}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        <strong>{formatMessage('location.beneficiaries')}:</strong> {location.countActive || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={3} style={{ padding: '20px' }}>
                  <Typography variant="h6" gutterBottom>
                    {formatMessage('payroll.parameters')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <DatePicker
                        label={formatMessage('payroll.paymentDate')}
                        value={paymentDate}
                        onChange={setPaymentDate}
                        format="dd/MM/yyyy"
                        className={classes.datePicker}
                        disablePast
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <PublishedComponent
                        pubRef="contributionPlan.PaymentPlanPicker"
                        required
                        filterLabels={false}
                        onChange={setPaymentPlan}
                        value={paymentPlan}
                        benefitPlanId={location.benefitPlanId}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            autoFocus
            disabled={generating}
          >
            {formatMessage('dialog.cancel')}
          </Button>
          <Button
            onClick={handleGenerate}
            variant="contained"
            color="primary"
            disabled={generating}
          >
            {formatMessage('payroll.generate')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GeneratePayrollDialog;
