import React, { useState } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  CircularProgress,
  TextField,
  FormControl,
  FormLabel,
} from '@material-ui/core';
import {
  formatMessage,
  formatMessageWithValues,
  coreAlert,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { csvUpdateGroupBeneficiaryStatus } from '../actions';
import BeneficiaryStatusPicker from '../pickers/BeneficiaryStatusPicker';

const styles = (theme) => ({
  item: theme.paper.item,
});

function GroupBeneficiaryCSVUpdateDialog({
  intl,
  classes,
  open,
  onClose,
  benefitPlan,
  csvUpdateGroupBeneficiaryStatus,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const validTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel'];

      if (!validTypes.includes(fileType)) {
        coreAlert(
          formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.invalidFileType'),
          formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.invalidFileTypeDetail'),
        );
        return;
      }

      setFile(selectedFile);
    }
  };

  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1]; // Remove data:text/csv;base64, prefix
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async () => {
    if (!file || !status) {
      coreAlert(
        formatMessage(intl, 'socialProtection', 'validation.required'),
        formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.requiredFields'),
      );
      return;
    }

    setIsLoading(true);

    try {
      const base64Content = await readFileAsBase64(file);

      await csvUpdateGroupBeneficiaryStatus(
        base64Content,
        status,
        benefitPlan.id,
        reason,
        formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.mutationLabel', {
          filename: file.name,
        }),
      );

      setIsLoading(false);

      coreAlert(
        formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.success'),
        formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.successDetail'),
      );

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      setIsLoading(false);
      coreAlert(
        formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.error'),
        error.message,
      );
    }
  };

  const handleClose = () => {
    setFile(null);
    setStatus('');
    setReason('');
    setIsLoading(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    const template = 'group_code,field1,field2,field3\n' + 
                    'GRP001,value1,value2,value3\n' +
                    'GRP002,value4,value5,value6\n' +
                    '# Note: group_code is required. All other fields will be stored in json_ext\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'group_beneficiary_status_update_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.title')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              {formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.description')}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleDownloadTemplate}
            >
              {formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.downloadTemplate')}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-file-input"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-input">
              <Button variant="contained" component="span" disabled={isLoading}>
                {formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.selectFile')}
              </Button>
            </label>
            {file && (
              <Typography variant="body2" style={{ marginTop: 8 }}>
                {formatMessageWithValues(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.selectedFile', {
                  filename: file.name,
                })}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth className={classes.item}>
              <FormLabel>
                {formatMessage(intl, 'socialProtection', 'beneficiary.status')}
              </FormLabel>
              <BeneficiaryStatusPicker
                withLabel={false}
                withNull={false}
                value={status}
                onChange={setStatus}
                disabled={isLoading}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.reason')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className={classes.item}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {formatMessage(intl, 'socialProtection', 'cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={!file || !status || isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            formatMessage(intl, 'socialProtection', 'groupBeneficiary.csvUpdate.submit')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  csvUpdateGroupBeneficiaryStatus,
}, dispatch);

export default withTheme(
  withStyles(styles)(
    connect(null, mapDispatchToProps)(
      injectIntl(GroupBeneficiaryCSVUpdateDialog),
    ),
  ),
);
