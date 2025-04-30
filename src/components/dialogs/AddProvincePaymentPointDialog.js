import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Divider,
  Typography,
} from '@material-ui/core';
import { useModulesManager, useTranslations, useGraphqlQuery } from '@openimis/fe-core';
import AddIcon from '@material-ui/icons/Add';
import { addProvincePaymentPoint } from '../../actions';
import ProvincePaymentPointChips from '../ProvincePaymentPointChips';

function AddProvincePaymentPointDialog({
  location,
  buttonLabel,
  addProvincePaymentPoint,
  addingProvincePaymentPoint,
  addedProvincePaymentPoint,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);
  const [open, setOpen] = useState(false);
  const [selectedPaymentPoint, setSelectedPaymentPoint] = useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState('');
  const [refreshChips, setRefreshChips] = useState(false);

  // Query to fetch available payment points
  const { isLoading: loadingPaymentPoints, data: paymentPointsData } = useGraphqlQuery(`
    query {
      paymentPoint {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `);

  // Query to fetch payment plans for the benefit plan
  const { isLoading: loadingPaymentPlans, data: paymentPlansData } = useGraphqlQuery(`
    query($benefitPlanId: String!) {
      paymentPlan(benefitPlanId: $benefitPlanId) {
        edges {
          node {
            id
            code
            name
          }
        }
      }
    }
  `, { benefitPlanId: location?.benefitPlanId });

  // Reset selected values when dialog is opened
  useEffect(() => {
    if (open) {
      setSelectedPaymentPoint('');
      setSelectedPaymentPlan('');
    }
  }, [open]);

  // Handle successful addition of payment point
  useEffect(() => {
    if (addedProvincePaymentPoint && open) {
      setOpen(false);
      setRefreshChips((prev) => !prev); // Toggle to trigger refresh
    }
  }, [addedProvincePaymentPoint]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedPaymentPoint) return;

    const params = {
      provinceId: location.id,
      paymentPointId: selectedPaymentPoint,
    };

    if (selectedPaymentPlan) {
      params.paymentPlanId = selectedPaymentPlan;
    }

    addProvincePaymentPoint(params, formatMessage('provincePaymentPoint.mutation.add'));
    handleClose();
    window.location.reload();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        size="small"
      >
        {buttonLabel}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="payment-point-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="payment-point-dialog-title">
          {formatMessage('provincePaymentPoint.dialog.add.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {formatMessage('provincePaymentPoint.dialog.add.message')}
          </DialogContentText>

          <Box mt={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-point-label">
                {formatMessage('provincePaymentPoint.dialog.paymentPoint')}
              </InputLabel>
              <Select
                labelId="payment-point-label"
                value={selectedPaymentPoint}
                onChange={(e) => setSelectedPaymentPoint(e.target.value)}
                disabled={loadingPaymentPoints}
              >
                {paymentPointsData?.paymentPoint?.edges?.map(({ node }) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                    {' '}
                    (
                    {node.code}
                    )
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="payment-plan-label">
                {formatMessage('provincePaymentPoint.dialog.paymentPlan')}
              </InputLabel>
              <Select
                labelId="payment-plan-label"
                value={selectedPaymentPlan}
                onChange={(e) => setSelectedPaymentPlan(e.target.value)}
                disabled={loadingPaymentPlans}
              >
                <MenuItem value="">
                  {formatMessage('provincePaymentPoint.allPlans')}
                </MenuItem>
                {paymentPlansData?.paymentPlan?.edges?.map(({ node }) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box mt={4} mb={2}>
            <Divider />
            <Typography variant="subtitle1" gutterBottom style={{ marginTop: 16 }}>
              {formatMessage('provincePaymentPoint.currentAssignments')}
            </Typography>
            <ProvincePaymentPointChips
              location={location}
              benefitPlan={location?.benefitPlanId}
              refresh={refreshChips}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" disabled={addingProvincePaymentPoint}>
            {formatMessage('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!selectedPaymentPoint || addingProvincePaymentPoint}
            startIcon={addingProvincePaymentPoint ? <CircularProgress size={20} /> : null}
          >
            {formatMessage('provincePaymentPoint.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapStateToProps = (state) => ({
  addingProvincePaymentPoint: state.socialProtection.addingProvincePaymentPoint,
  addedProvincePaymentPoint: state.socialProtection.addedProvincePaymentPoint,
  errorProvincePaymentPoint: state.socialProtection.errorProvincePaymentPoint,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  addProvincePaymentPoint,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AddProvincePaymentPointDialog);
