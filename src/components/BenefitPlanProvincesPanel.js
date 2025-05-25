import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Paper, Grid, Typography, Divider,
} from '@material-ui/core';
import {
  useModulesManager, useTranslations, Searcher, withHistory,
} from '@openimis/fe-core';
import { makeStyles } from '@material-ui/styles';
import { fetchBenefitPlanProvinces } from '../actions';
import { DEFAULT_PAGE_SIZE, ROWS_PER_PAGE_OPTIONS } from '../constants';
import BenefitPlanLocationsFilter from './BenefitPlanLocationsFilter';
import GeneratePayrollDialog from './dialogs/GeneratePayrollDialog';
import AddProvincePaymentPointDialog from './dialogs/AddProvincePaymentPointDialog';
import ProvincePaymentPointChips from './ProvincePaymentPointChips';

const useStyles = makeStyles((theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
}));

function BenefitPlanProvincesPanel({
  benefitPlan, rights, fetchBenefitPlanProvinces,
  fetchingBenefitPlanProvinces, fetchedBenefitPlanProvinces, errorBenefitPlanProvinces,
  benefitPlanProvinces, benefitPlanProvincesPageInfo, provincesTotalCount,
}) {
  const classes = useStyles();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);

  const defaultFilters = () => {
    const filters = {
      type: {
        value: 'D',
        filter:
        'type: "D"',
      },
    };
    return filters;
  };

  const fetch = (params) => {
    if (benefitPlan?.id) {
      params.push(`benefitPlan_Id: "${benefitPlan.id}"`);
      return fetchBenefitPlanProvinces(modulesManager, params);
    }
    return null;
  };

  const headers = (params) => {
    const heads = [];
    if (['W', 'V'].includes(params?.type?.value)) {
      heads.push('province');
    }
    if (['V'].includes(params?.type?.value)) {
      heads.push('commune');
    }
    heads.push('location.name');
    heads.push('location.code');
    heads.push('province.beneficiary.count.selected');
    heads.push('province.beneficiary.count.active');
    heads.push('payroll.paymentPoint.page.title');
    // heads.push('province.beneficiary.count.suspended');
    heads.push('province.benefitPlan.cards');
    heads.push('province.benefitPlan.payroll');
    return heads;
  };

  const itemFormatters = (params) => {
    const values = [];
    if (['W'].includes(params?.type?.value)) {
      values.push((location) => location?.parent?.name);
    }
    if (['V'].includes(params?.type?.value)) {
      values.push((location) => location?.parent?.parent?.name);
      values.push((location) => location?.parent?.name);
    }
    values.push((location) => location.name);
    values.push((location) => location.code);
    values.push((location) => Number(location.countSelected)?.toLocaleString('fr-FR'));
    values.push((location) => Number(location.countActive)?.toLocaleString('fr-FR'));
    // Payment point column - show chips and add button
    values.push((location) => (
      <Grid container spacing={1}>
        <Grid item>
          <ProvincePaymentPointChips 
            location={{...location}} 
            benefitPlan={benefitPlan.id} 
          />
        </Grid>
        <Grid item>
          <AddProvincePaymentPointDialog 
            location={{...location, benefitPlanId: benefitPlan.id}} 
            buttonLabel={formatMessage('provincePaymentPoint.add')} 
          />
        </Grid>
      </Grid>
    ));
    values.push((location) => location.countActive > 0 ? (
      <a 
        href={`/api/merankabandi/location/${location.id}/generate-cards-background/`} 
        onClick={(e) => {
          e.preventDefault();
          fetch(`/api/merankabandi/location/${location.id}/generate-cards-background/`)
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert(formatMessage('cards.generationStarted'));
              } else {
                alert(formatMessage('cards.generationError') + ': ' + data.message);
              }
            })
            .catch(error => {
              alert(formatMessage('cards.generationError') + ': ' + error.message);
            });
        }}
      >
        Générer
      </a>
    ) : null);
    values.push((location) => location.countActive > 0 ? <GeneratePayrollDialog location={{...location, benefitPlanId: benefitPlan.id}} buttonLabel="Générer" /> : null);

    return values;
  };

  const sorts = () => [
    ['code', true],
    ['name', true],
    ['beneficiaryCount', true],
  ];

  const benefitPlanLocationsFilter = (props) => (
    <BenefitPlanLocationsFilter
      intl={props.intl}
      classes={props.classes}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
    />
  );

  return (
    <Searcher
      module="socialProtection"
      FilterPane={benefitPlanLocationsFilter}
      fetch={fetch}
      items={benefitPlanProvinces}
      itemsPageInfo={benefitPlanProvincesPageInfo}
      fetchingItems={fetchingBenefitPlanProvinces}
      fetchedItems={fetchedBenefitPlanProvinces}
      errorItems={errorBenefitPlanProvinces}
      tableTitle={formatMessageWithValues('benefitPlanProvinces.searcherResultsTitle', { totalCount: provincesTotalCount })}
      headers={headers}
      itemFormatters={itemFormatters}
      defaultFilters={defaultFilters()}
      sorts={sorts}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      defaultPageSize={DEFAULT_PAGE_SIZE}
    />
  );
}

const mapStateToProps = (state) => ({
  fetchingBenefitPlanProvinces: state.socialProtection.fetchingBenefitPlanProvinces,
  fetchedBenefitPlanProvinces: state.socialProtection.fetchedBenefitPlanProvinces,
  errorBenefitPlanProvinces: state.socialProtection.errorBenefitPlanProvinces,
  benefitPlanProvinces: state.socialProtection.benefitPlanProvinces,
  benefitPlanProvincesPageInfo: state.socialProtection.benefitPlanProvincesPageInfo,
  provincesTotalCount: state.socialProtection.benefitPlanProvincesTotalCount,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBenefitPlanProvinces,
}, dispatch);

export default withHistory(connect(mapStateToProps, mapDispatchToProps)(BenefitPlanProvincesPanel));
