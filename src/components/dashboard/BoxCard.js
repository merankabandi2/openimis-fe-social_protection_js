import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ReceiptIcon from '@material-ui/icons/Receipt';

const useStyles = makeStyles((theme) => ({
  root: {
    // Add any custom styles here
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    height: 56,
    width: 56,
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textWrapper: {
    marginRight: theme.spacing(3),
  },
}));

function BoxCard({
  label, value, valueVariant = 'h4', className, icon = <ReceiptIcon fontSize="large" />,
}) {
  const classes = useStyles();

  return (
    <Card className={className}>
      <CardContent>
        <Box className={classes.contentWrapper}>
          <Box className={classes.textWrapper}>
            <Typography color="textSecondary" variant="overline">
              {label}
            </Typography>
            <Box mt={1}>
              <Typography variant={valueVariant}>{value}</Typography>
            </Box>
          </Box>
          <Avatar className={classes.avatar}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default BoxCard;
