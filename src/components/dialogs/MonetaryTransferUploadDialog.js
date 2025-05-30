import React, { useState } from 'react';
import {
  Input, Grid, Typography, LinearProgress, Link
} from '@material-ui/core';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert from '@material-ui/lab/Alert';
import {
  apiHeaders,
  baseApiUrl,
  useModulesManager,
  formatMessage,
  coreAlert,
  FormattedMessage,
} from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const styles = (theme) => ({
  item: theme.paper.item,
  uploadInput: {
    display: 'none',
  },
  uploadButton: {
    margin: theme.spacing(1),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
  },
  resultsContainer: {
    marginTop: theme.spacing(2),
  },
  errorList: {
    maxHeight: '200px',
    overflow: 'auto',
    marginTop: theme.spacing(1),
  },
});

function MonetaryTransferUploadDialog({
  intl,
  classes,
  coreAlert,
  onUploadSuccess,
}) {
  const modulesManager = useModulesManager();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleOpen = () => {
    setIsOpen(true);
    setUploadResult(null);
  };

  const handleClose = () => {
    setFile(null);
    setUploadResult(null);
    setIsOpen(false);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        coreAlert(
          formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.invalidFileType'),
          formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.selectValidFile')
        );
        return;
      }
      
      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch(
        `${baseApiUrl}/merankabandi/monetary-transfers/template/`,
        {
          method: 'GET',
          headers: apiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template_transferts_monetaires.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      coreAlert(
        formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.templateError'),
        error.message
      );
    }
  };

  const handleUpload = async () => {
    if (!file) {
      coreAlert(
        formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.noFile'),
        formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.selectFile')
      );
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${baseApiUrl}/merankabandi/monetary-transfers/import/`,
        {
          method: 'POST',
          headers: apiHeaders(false), // Don't include Content-Type header for FormData
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      
      if (result.success && result.imported > 0 && onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      coreAlert(
        formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.error'),
        error.message
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        className={classes.uploadButton}
      >
        {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.button')}
      </Button>
      
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.title')}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.description')}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Link
                component="button"
                variant="body2"
                onClick={downloadTemplate}
              >
                {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.downloadTemplate')}
              </Link>
            </Grid>
            
            <Grid item xs={12}>
              <input
                accept=".csv,.xls,.xlsx"
                className={classes.uploadInput}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={uploading}
                >
                  {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.selectFile')}
                </Button>
              </label>
              
              {file && (
                <Typography variant="body2" style={{ marginTop: 8 }}>
                  {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.selectedFile')}: {file.name}
                </Typography>
              )}
            </Grid>
            
            {uploading && (
              <Grid item xs={12} className={classes.progressContainer}>
                <LinearProgress />
                <Typography variant="body2" align="center" style={{ marginTop: 8 }}>
                  {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.uploading')}
                </Typography>
              </Grid>
            )}
            
            {uploadResult && (
              <Grid item xs={12} className={classes.resultsContainer}>
                {uploadResult.success ? (
                  <>
                    <Alert severity="success">
                      {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.success', {
                        imported: uploadResult.imported,
                        failed: uploadResult.failed
                      })}
                    </Alert>
                    
                    {uploadResult.failed > 0 && uploadResult.invalid_items && (
                      <div className={classes.errorList}>
                        <Typography variant="subtitle2" style={{ marginTop: 16 }}>
                          {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.errors')}:
                        </Typography>
                        {uploadResult.invalid_items.map((item, index) => (
                          <Alert severity="error" key={index} style={{ marginTop: 4 }}>
                            Row {item.row}: {item.error}
                          </Alert>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Alert severity="error">
                    {uploadResult.error || formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.failed')}
                  </Alert>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="default">
            {formatMessage(intl, 'socialProtection', 'close')}
          </Button>
          <Button
            onClick={handleUpload}
            color="primary"
            disabled={!file || uploading}
          >
            {formatMessage(intl, 'socialProtection', 'monetaryTransfer.upload.import')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  coreAlert,
}, dispatch);

export default injectIntl(
  withTheme(
    withStyles(styles)(
      connect(null, mapDispatchToProps)(MonetaryTransferUploadDialog)
    )
  )
);