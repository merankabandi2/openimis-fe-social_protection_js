import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CheckCircle, Cancel } from '@material-ui/icons';
import { useModulesManager, formatMessage, graphqlWithVariables } from '@openimis/fe-core';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    minWidth: '600px',
  },
  sectionTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  },
  dataRow: {
    marginBottom: theme.spacing(1),
  },
  label: {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  },
  statusChip: {
    marginTop: theme.spacing(1),
  },
  commentField: {
    marginTop: theme.spacing(2),
  },
  actionButtons: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const ValidationDialog = ({ open, onClose, data, type, onValidated }) => {
  const classes = useStyles();
  const intl = useIntl();
  const modulesManager = useModulesManager();
  const dispatch = useDispatch();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'validate' or 'reject'
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Determine the mutation based on type
  const mutationMap = {
    sensitization: 'validateSensitizationTraining',
    behavior_change: 'validateBehaviorChange',
    microproject: 'validateMicroproject',
  };
  
  // Helper function to get category display label
  const getCategoryLabel = (categoryKey) => {
    if (!categoryKey) return '';
    
    // Try to get translation first - handle both lowercase and uppercase keys
    const normalizedKey = categoryKey.toLowerCase();
    const translationKey = `sensitizationTraining.category.${normalizedKey}`;
    const translated = intl.formatMessage({ id: translationKey });
    
    // If translation exists (not same as key), return it
    if (translated !== translationKey) {
      return translated;
    }
    
    // Otherwise return the original value
    return categoryKey;
  };

  const handleValidation = (status) => {
    // Show confirmation dialog first
    setConfirmAction(status);
    setShowConfirmDialog(true);
  };

  const handleConfirmValidation = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);
    
    const mutationName = mutationMap[type];
    
    // Map mutation names to their correct input types
    const inputTypeMap = {
      validateSensitizationTraining: 'ValidateSensitizationTrainingMutationInput',
      validateBehaviorChange: 'ValidateBehaviorChangeMutationInput',
      validateMicroproject: 'ValidateMicroProjectMutationInput',
    };
    
    const inputType = inputTypeMap[mutationName];
    
    const mutation = `
      mutation ${mutationName}($input: ${inputType}!) {
        ${mutationName}(input: $input) {
          internalId
          clientMutationId
        }
      }
    `;
    
    const variables = {
      id: data.id || data.uuid,
      status: confirmAction,
      comment: comment || null,
      clientMutationId: `${mutationName}-${Date.now()}`,
    };
    
    try {
      dispatch(
        graphqlWithVariables(
          mutation,
          { input: variables },
          ['SOCIAL_PROTECTION_MUTATION_REQ', 'SOCIAL_PROTECTION_MUTATION_RESP', 'SOCIAL_PROTECTION_MUTATION_ERR']
        )
      );
      
      // Since graphql action doesn't return a promise, we'll handle success optimistically
      setTimeout(() => {
        setIsSubmitting(false);
        onValidated();
        onClose();
      }, 1000);
      
    } catch (error) {
      setIsSubmitting(false);
      console.error('Validation error:', error);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const renderDataDetails = () => {
    if (!data) return null;

    switch (type) {
      case 'sensitization':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'socialProtection', 'validation.trainingDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.date')}:</span>
              {data.sensitizationDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.location')}:</span>
              {data.location?.name}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.category')}:</span>
              {getCategoryLabel(data.category)}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.facilitator')}:</span>
              {data.facilitator}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'socialProtection', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.men')}:</span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.women')}:</span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.twa')}:</span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            {data.observations && (
              <Box className={classes.dataRow}>
                <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.observations')}:</span>
                {data.observations}
              </Box>
            )}
          </>
        );

      case 'behavior_change':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'socialProtection', 'validation.behaviorChangeDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.date')}:</span>
              {data.reportDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.location')}:</span>
              {data.location?.name}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'socialProtection', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.men')}:</span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.women')}:</span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.twa')}:</span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            {data.comments && (
              <Box className={classes.dataRow}>
                <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.comments')}:</span>
                {data.comments}
              </Box>
            )}
          </>
        );

      case 'microproject':
        return (
          <>
            <Typography className={classes.sectionTitle} variant="h6">
              {formatMessage(intl, 'socialProtection', 'validation.microprojectDetails')}
            </Typography>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.date')}:</span>
              {data.reportDate}
            </Box>
            <Box className={classes.dataRow}>
              <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.location')}:</span>
              {data.location?.name}
            </Box>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'socialProtection', 'validation.participants')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.men')}:</span>
                  {data.maleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.women')}:</span>
                  {data.femaleParticipants}
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.twa')}:</span>
                  {data.twaParticipants}
                </Box>
              </Grid>
            </Grid>
            <Divider />
            <Typography className={classes.sectionTitle} variant="subtitle1">
              {formatMessage(intl, 'socialProtection', 'validation.projectTypes')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.agriculture')}:</span>
                  {data.agricultureBeneficiaries}
                </Box>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.livestock')}:</span>
                  {data.livestockBeneficiaries}
                </Box>
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.commerce')}:</span>
                  {data.commerceServicesBeneficiaries}
                </Box>
              </Grid>
              <Grid item xs={6}>
                {data.livestockGoatBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.goats')}:</span>
                    {data.livestockGoatBeneficiaries}
                  </Box>
                )}
                {data.livestockPigBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.pigs')}:</span>
                    {data.livestockPigBeneficiaries}
                  </Box>
                )}
                {data.livestockRabbitBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.rabbits')}:</span>
                    {data.livestockRabbitBeneficiaries}
                  </Box>
                )}
                {data.livestockPoultryBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.poultry')}:</span>
                    {data.livestockPoultryBeneficiaries}
                  </Box>
                )}
                {data.livestockCattleBeneficiaries > 0 && (
                  <Box className={classes.dataRow}>
                    <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.cattle')}:</span>
                    {data.livestockCattleBeneficiaries}
                  </Box>
                )}
              </Grid>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        classes={{ paper: classes.dialogPaper }}
        maxWidth="md"
      >
        <DialogTitle>
          {formatMessage(intl, 'socialProtection', 'validation.dialog.title')}
          {data?.validationStatus && (
            <Chip
              label={data.validationStatusDisplay || data.validationStatus}
              color={data.validationStatus === 'VALIDATED' ? 'primary' : 'default'}
              size="small"
              className={classes.statusChip}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {renderDataDetails()}
          
          {/* Show validation history if already validated */}
          {data?.validationStatus && data.validationStatus !== 'PENDING' && (
            <Box mt={2}>
              <Divider />
              <Typography className={classes.sectionTitle} variant="subtitle1">
                {formatMessage(intl, 'socialProtection', 'validation.history')}
              </Typography>
              {data.validatedBy && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.dialog.validatedBy')}:</span>
                  {data.validatedBy.username || data.validatedBy}
                </Box>
              )}
              {data.validationDate && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.dialog.validatedOn')}:</span>
                  {data.validationDate}
                </Box>
              )}
              {data.validationComment && (
                <Box className={classes.dataRow}>
                  <span className={classes.label}>{formatMessage(intl, 'socialProtection', 'validation.previousComment')}:</span>
                  {data.validationComment}
                </Box>
              )}
            </Box>
          )}
          
          <TextField
            className={classes.commentField}
            fullWidth
            multiline
            rows={3}
            label={formatMessage(intl, 'socialProtection', 'validation.dialog.comment')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            {formatMessage(intl, 'socialProtection', 'validation.dialog.close')}
          </Button>
          <Box className={classes.actionButtons}>
            <Button
              onClick={() => handleValidation('REJECTED')}
              color="secondary"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Cancel />}
              disabled={isSubmitting || (data?.validationStatus && data.validationStatus !== 'PENDING')}
            >
              {formatMessage(intl, 'socialProtection', 'validation.dialog.reject')}
            </Button>
            <Button
              onClick={() => handleValidation('VALIDATED')}
              color="primary"
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
              disabled={isSubmitting || (data?.validationStatus && data.validationStatus !== 'PENDING')}
            >
              {formatMessage(intl, 'socialProtection', 'validation.dialog.validate')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelConfirmation}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {formatMessage(intl, 'socialProtection', 
            confirmAction === 'VALIDATED' ? 'validation.confirm.validate.title' : 'validation.confirm.reject.title'
          )}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {formatMessage(intl, 'socialProtection',
              confirmAction === 'VALIDATED' ? 'validation.confirm.validate.message' : 'validation.confirm.reject.message'
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirmation}>
            {formatMessage(intl, 'socialProtection', 'validation.confirm.cancel')}
          </Button>
          <Button 
            onClick={handleConfirmValidation} 
            color="primary" 
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            {formatMessage(intl, 'socialProtection', 'validation.confirm.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ValidationDialog;