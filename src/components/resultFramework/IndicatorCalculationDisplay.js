import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  Paper,
  Grid,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SystemIcon,
  Edit as ManualIcon,
  CallMerge as MixedIcon,
  Info as InfoIcon,
} from '@material-ui/icons';
import { withTheme, withStyles } from '@material-ui/core/styles';

import { formatMessage, formatDateFromISO } from '@openimis/fe-core';
import { calculateIndicatorValue } from '../../actions/resultFramework';

const styles = (theme) => ({
  paper: {
    ...theme.paper.paper,
    padding: theme.spacing(2),
  },
  indicatorRow: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid #e0e0e0',
    borderRadius: theme.shape.borderRadius,
  },
  progressContainer: {
    position: 'relative',
    marginTop: theme.spacing(1),
  },
  progressBar: {
    height: 20,
    borderRadius: 10,
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    top: '50%',
    transform: 'translateY(-50%)',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  },
  systemChip: {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  manualChip: {
    backgroundColor: theme.palette.warning.main,
    color: 'white',
  },
  mixedChip: {
    backgroundColor: theme.palette.info.main,
    color: 'white',
  },
  detailsTable: {
    '& td': {
      padding: theme.spacing(0.5, 2),
    },
  },
});

function IndicatorCalculationDisplay({
  intl,
  classes,
  theme,
  indicator,
  dateFrom,
  dateTo,
  locationId,
  autoRefresh = false,
  showDetails = true,
  calculateIndicatorValue,
}) {
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      handleCalculate();
    }
  }, [indicator, dateFrom, dateTo, locationId]);

  const handleCalculate = async () => {
    if (!indicator?.id) return;
    
    setLoading(true);
    try {
      const response = await calculateIndicatorValue(
        indicator.id,
        dateFrom,
        dateTo,
        locationId
      );
      
      if (response?.payload?.data?.calculateIndicatorValue) {
        setCalculationResult(response.payload.data.calculateIndicatorValue);
      }
    } catch (error) {
      console.error('Error calculating indicator:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCalculationIcon = (type) => {
    switch (type) {
      case 'SYSTEM':
        return <SystemIcon fontSize="small" />;
      case 'MANUAL':
        return <ManualIcon fontSize="small" />;
      case 'MIXED':
        return <MixedIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getCalculationChipClass = (type) => {
    switch (type) {
      case 'SYSTEM':
        return classes.systemChip;
      case 'MANUAL':
        return classes.manualChip;
      case 'MIXED':
        return classes.mixedChip;
      default:
        return '';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const value = calculationResult?.value || 0;
  const target = parseFloat(indicator?.target || 0);
  const percentage = target > 0 ? (value / target) * 100 : 0;

  return (
    <Paper className={classes.indicatorRow}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h6">{indicator.name}</Typography>
          {indicator.pbc && (
            <Typography variant="caption" color="textSecondary">
              PBC: {indicator.pbc}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage(intl, 'socialProtection', 'indicator.baseline')}
          </Typography>
          <Typography variant="h6">{indicator.baseline || 0}</Typography>
        </Grid>
        
        <Grid item xs={6} md={2}>
          <Typography variant="body2" color="textSecondary">
            {formatMessage(intl, 'socialProtection', 'indicator.target')}
          </Typography>
          <Typography variant="h6">{target}</Typography>
        </Grid>
        
        <Grid item xs={6} md={1}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Typography variant="body2" color="textSecondary">
                {formatMessage(intl, 'socialProtection', 'indicator.achieved')}
              </Typography>
              <Typography variant="h6">{value}</Typography>
            </>
          )}
        </Grid>
        
        <Grid item xs={6} md={1} style={{ textAlign: 'right' }}>
          <Tooltip title={formatMessage(intl, 'socialProtection', 'indicator.refresh')}>
            <IconButton size="small" onClick={handleCalculate} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {showDetails && (
            <Tooltip title={formatMessage(intl, 'socialProtection', 'indicator.details')}>
              <IconButton size="small" onClick={() => setExpanded(!expanded)}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Box className={classes.progressContainer}>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              className={classes.progressBar}
              style={{ backgroundColor: '#e0e0e0' }}
              color="primary"
              classes={{
                barColorPrimary: {
                  backgroundColor: getProgressColor(percentage),
                },
              }}
            />
            <Typography className={classes.progressText}>
              {percentage.toFixed(1)}%
            </Typography>
          </Box>
        </Grid>
        
        {calculationResult && (
          <Grid item xs={12}>
            <Chip
              icon={getCalculationIcon(calculationResult.calculationType)}
              label={formatMessage(intl, 'socialProtection', `calculation.type.${calculationResult.calculationType}`)}
              size="small"
              className={getCalculationChipClass(calculationResult.calculationType)}
            />
            {calculationResult.error && (
              <Chip
                label={calculationResult.error}
                size="small"
                color="secondary"
                style={{ marginLeft: 8 }}
              />
            )}
          </Grid>
        )}
      </Grid>
      
      {showDetails && expanded && calculationResult && (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{formatMessage(intl, 'socialProtection', 'indicator.calculationDetails')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small" className={classes.detailsTable}>
              <TableBody>
                {calculationResult.calculationType === 'MIXED' && (
                  <>
                    <TableRow>
                      <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.systemValue')}</TableCell>
                      <TableCell align="right">{calculationResult.systemValue || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.manualValue')}</TableCell>
                      <TableCell align="right">{calculationResult.manualValue || 0}</TableCell>
                    </TableRow>
                  </>
                )}
                {calculationResult.date && (
                  <TableRow>
                    <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.lastUpdated')}</TableCell>
                    <TableCell align="right">{formatDateFromISO(calculationResult.date)}</TableCell>
                  </TableRow>
                )}
                {calculationResult.genderBreakdown && (
                  <TableRow>
                    <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.genderBreakdown')}</TableCell>
                    <TableCell align="right">
                      {Object.entries(calculationResult.genderBreakdown).map(([gender, count]) => (
                        <Chip
                          key={gender}
                          label={`${gender}: ${count}`}
                          size="small"
                          style={{ margin: 2 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                )}
                {dateFrom && (
                  <TableRow>
                    <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.dateFrom')}</TableCell>
                    <TableCell align="right">{formatDateFromISO(dateFrom)}</TableCell>
                  </TableRow>
                )}
                {dateTo && (
                  <TableRow>
                    <TableCell>{formatMessage(intl, 'socialProtection', 'indicator.dateTo')}</TableCell>
                    <TableCell align="right">{formatDateFromISO(dateTo)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  calculateIndicatorValue,
}, dispatch);

export default injectIntl(
  connect(null, mapDispatchToProps)(
    withTheme(withStyles(styles)(IndicatorCalculationDisplay))
  )
);