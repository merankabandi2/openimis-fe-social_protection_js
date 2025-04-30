import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@material-ui/core';
import { useModulesManager, useTranslations, useGraphqlMutation } from '@openimis/fe-core';

function DeleteProvincePaymentPointDialog({
  open,
  paymentPoint,
  onClose,
  onConfirm,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);

  const loading = false;
  const error = false;

  const handleConfirm = async () => {
    if (!paymentPoint) return;

    try {
      onConfirm();
    } catch (err) {
      console.error('Error deleting payment point:', err);
    }
  };

  if (!paymentPoint) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-payment-point-dialog-title"
    >
      <DialogTitle id="delete-payment-point-dialog-title">
        {formatMessage('provincePaymentPoint.dialog.delete.title')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {formatMessageWithValues('provincePaymentPoint.dialog.delete.message', {
            provinceName: paymentPoint?.province?.name || '',
            paymentPointName: paymentPoint?.paymentPoint?.name || '',
            planName: paymentPoint?.paymentPlan?.benefitPlan?.name || formatMessage('provincePaymentPoint.allPlans'),
          })}
        </DialogContentText>
        {error && (
          <DialogContentText color="error">
            {formatMessage('provincePaymentPoint.dialog.delete.error')}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={loading}>
          {formatMessage('cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {formatMessage('delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteProvincePaymentPointDialog;
