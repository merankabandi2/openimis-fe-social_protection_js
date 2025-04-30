import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Chip, Grid, Typography, Box, CircularProgress
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { useModulesManager, useTranslations, useGraphqlQuery } from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import DeleteProvincePaymentPointDialog from './dialogs/DeleteProvincePaymentPointDialog';

const useStyles = makeStyles((theme) => ({
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  noData: {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
}));

function ProvincePaymentPointChips({ location, benefitPlan, refresh }) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPaymentPoint, setSelectedPaymentPoint] = useState(null);

  // Query to fetch payment points for the province
  const { isLoading, data, error, refetch } = useGraphqlQuery(
    `
    query ($provinceId: ID!, $isActive: Boolean) {
      provincePaymentPoint(
        provinceId: $provinceId,
        isActive: $isActive
      ) {
        edges {
          node {
            id
            province {
              id
              name
            }
            paymentPoint {
              id
              name
            }
            paymentPlan {
              id
              code
              name
            }
            isActive
          }
        }
      }
    }
    `,
    { provinceId: Number.parseInt(location?.id, 10), isActive: true }
  );

  useEffect(() => {
    if (refresh) {
      refetch();
    }
  }, [refresh]);

  const handleDelete = (paymentPoint) => {
    setSelectedPaymentPoint(paymentPoint);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPaymentPoint(null);
  };

  const handleConfirmDelete = () => {
    // Deletion will be handled by the dialog component
    handleCloseDeleteDialog();
    refetch(); // Refresh the list after deletion
  };

  // Group payment points by benefit plan
  const groupedPaymentPoints = {};
  if (data?.provincePaymentPoint?.edges) {
    data.provincePaymentPoint.edges.forEach(({ node }) => {
      const planId = node.paymentPlan?.benefitPlan?.id || 'all';
      const planName = node.paymentPlan?.benefitPlan?.name || 'All Plans';
      
      if (!groupedPaymentPoints[planId]) {
        groupedPaymentPoints[planId] = {
          planName,
          paymentPoints: []
        };
      }
      
      groupedPaymentPoints[planId].paymentPoints.push(node);
    });
  }

  if (isLoading) return <CircularProgress size={20} />;
  
  if (error) return <Typography color="error">{formatMessage('provincePaymentPoint.fetchError')}</Typography>;
  
  if (Object.keys(groupedPaymentPoints).length === 0) {
    return (
      <Typography className={classes.noData}>
        {formatMessage('provincePaymentPoint.noPaymentPoints')}
      </Typography>
    );
  }

  return (
    <Box>
      {Object.entries(groupedPaymentPoints).map(([planId, { planName, paymentPoints }]) => (
        <Box key={planId} mb={2}>
          {Object.keys(groupedPaymentPoints).length > 1 && (
            <Typography variant="subtitle2" gutterBottom>
              {planName}
            </Typography>
          )}
          <div className={classes.chips}>
            {paymentPoints.map((paymentPoint) => (
              <Chip
                key={paymentPoint.id}
                label={paymentPoint.paymentPoint.name}
                className={classes.chip}
                onDelete={() => handleDelete(paymentPoint)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </div>
        </Box>
      ))}

      <DeleteProvincePaymentPointDialog
        open={openDeleteDialog}
        paymentPoint={selectedPaymentPoint}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

export default ProvincePaymentPointChips;
