import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Typography } from '@material-ui/core';
import ReceiptIcon from '@material-ui/icons/Receipt';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: props => props.color || theme.palette.primary.main,
      borderRadius: '4px 4px 0 0',
    },
  },
  avatar: {
    backgroundColor: props => props.color ? `${props.color}20` : `${theme.palette.primary.main}20`,
    color: props => props.color || theme.palette.primary.main,
    height: props => props.compact ? 48 : 56,
    width: props => props.compact ? 48 : 56,
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textWrapper: {
    marginRight: theme.spacing(2),
    flex: 1,
  },
  value: {
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: props => props.compact ? 80 : 100,
  },
}));

function BoxCard({
  label, value, valueVariant = 'h4', className, icon = <ReceiptIcon fontSize="large" />, isLoading = false, color, compact = false, subtitle = null,
}) {
  const classes = useStyles({ color, compact });

  return (
    <Card className={`${className} ${classes.root}`}>
      <CardContent style={{ padding: compact ? '12px 16px' : '16px' }}>
        {isLoading ? (
          <div className={classes.loadingContainer}>
            <CircularProgress size={40} style={{ color: color || 'inherit' }} />
          </div>
        ) : (
          <Box className={classes.contentWrapper}>
            <Box className={classes.textWrapper}>
              <Typography className={classes.label} color="textSecondary" variant="overline">
                {label}
              </Typography>
              <Box mt={compact ? 0.5 : 1}>
                <Typography variant={compact ? 'h5' : valueVariant} className={classes.value}>
                  {value}
                </Typography>
                {subtitle && subtitle.trim() !== '' && (
                  <Typography variant="caption" style={{ color: 'rgba(0, 0, 0, 0.6)', marginTop: 4, display: 'block' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            <Avatar className={classes.avatar}>
              {React.cloneElement(icon, { fontSize: compact ? 'default' : 'large' })}
            </Avatar>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default BoxCard;
