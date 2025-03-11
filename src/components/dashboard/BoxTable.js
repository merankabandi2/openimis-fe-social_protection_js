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
    marginTop: theme.spacing(2),
  },
  tableContainer: {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    maxHeight: props => props.maxHeight || '400px',
    overflow: 'auto',
  },
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    tableLayout: 'fixed',
  },
  headerRow: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
  },
  footerRow: {
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
    backgroundColor: theme.palette.grey[200], // Solid color for footer
  },
  headerCell: {
    fontWeight: 'bold',
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
  },
  cell: {
    padding: theme.spacing(1),
  },
  numericCell: {
    textAlign: 'right',
    padding: theme.spacing(1),
  },
  footerCell: {
    fontWeight: 'bold',
    padding: theme.spacing(1),
  },
  totalCell: {
    fontWeight: 500,
  },
  zebraRow: {
    backgroundColor: theme.palette.action.hover,
  },
}));

function DetailedDataTable({ locationData, maxHeight }) {
  const classes = useStyles({ maxHeight });

  // Sort data by name
  const sortedData = [...locationData].sort((a, b) => a.name.localeCompare(b.name));
  
  // Calculate totals
  const totalSelected = locationData.reduce((sum, loc) => sum + loc.countSelected, 0);
  const totalActive = locationData.reduce((sum, loc) => sum + loc.countActive, 0);

  return (
    <Box className={classes.root}>
      <Typography variant="h4" className={classes.title}>
        Provinces
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table size="small" className={classes.table} stickyHeader>
          <TableHead>
            <TableRow className={classes.headerRow}>
              <TableCell className={classes.headerCell}>Province</TableCell>
              <TableCell className={classes.headerCell}>Selectionés</TableCell>
              <TableCell className={classes.headerCell}>Actifs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((location, index) => (
              <TableRow 
                key={location.id} 
                className={index % 2 === 1 ? classes.zebraRow : undefined}
              >
                <TableCell className={classes.cell}>{location.name}</TableCell>
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
                {totalSelected.toLocaleString('fr-FR')}
              </TableCell>
              <TableCell className={`${classes.numericCell} ${classes.footerCell}`}>
                {totalActive.toLocaleString('fr-FR')}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DetailedDataTable;
