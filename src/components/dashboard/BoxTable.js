import React from 'react';
import {
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Typography,
  Box,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
  },
  tableContainer: {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
  },
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: theme.palette.background.default,
  },
  numericCell: {
    textAlign: 'right',
  },
  footerRow: {
    backgroundColor: theme.palette.action.hover,
  },
  footerCell: {
    fontWeight: 'bold',
  },
  totalCell: {
    fontWeight: 500,
  },
}));

function DetailedDataTable({ locationData }) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        Provinces
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.headerCell}>Province</TableCell>
              <TableCell className={classes.headerCell}>Selectionés</TableCell>
              <TableCell className={classes.headerCell}>Actifs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locationData
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell className={classes.numericCell}>
                    {location.countSelected.toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell className={classes.numericCell}>
                    {location.countActive.toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableRow className={classes.footerRow}>
              <TableCell className={classes.footerCell}>Total</TableCell>
              <TableCell className={`${classes.numericCell} ${classes.footerCell}`}>
                {locationData.reduce((sum, loc) => sum + loc.countSelected, 0).toLocaleString('fr-FR')}
              </TableCell>
              <TableCell className={`${classes.numericCell} ${classes.footerCell}`}>
                {locationData.reduce((sum, loc) => sum + loc.countActive, 0).toLocaleString('fr-FR')}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DetailedDataTable;
