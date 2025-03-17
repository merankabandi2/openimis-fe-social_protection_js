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
    heads.push('province.beneficiary.count.suspended');
    return heads;
  };

  const itemFormatters = (params) => {
    const values = [];
    if (['W'].includes(params?.type?.value)) {
      values.push((location) => location.parent.name);
    }
    if (['V'].includes(params?.type?.value)) {
      values.push((location) => location.parent.parent.name);
      values.push((location) => location.parent.name);
    }
    values.push((location) => location.name);
    values.push((location) => location.code);
    values.push((location) => location.countSelected);
    values.push((location) => location.countActive);
    values.push((location) => location.countSuspended);
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
