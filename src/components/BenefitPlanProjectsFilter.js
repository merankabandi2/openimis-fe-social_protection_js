import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { TextInput } from '@openimis/fe-core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _debounce from 'lodash/debounce';
import {
  CONTAINS_LOOKUP,
  DEFAULT_DEBOUNCE_TIME,
  EMPTY_STRING,
} from '../constants';
import { defaultFilterStyles } from '../util/styles';

// TODO Wei: skeleton only, make it functional
function BenefitPlanProjectsFilter({
  classes, filters, onChangeFilters,
}) {
  const debouncedOnChangeFilters = _debounce(onChangeFilters, DEFAULT_DEBOUNCE_TIME);

  const filterTextFieldValue = (filterName) => filters?.[filterName]?.value ?? EMPTY_STRING;

  const onChangeStringFilter = (filterName, lookup = null) => (value) => {
    const filter = lookup
      ? `${filterName}_${lookup}: "${value}"`
      : `${filterName}: "${value}"`;

    debouncedOnChangeFilters([
      {
        id: filterName,
        value,
        filter,
      },
    ]);
  };

  return (
    <Grid container className={classes.form}>
      <Grid item xs={3} className={classes.item}>
        <TextInput
          module="socialProtection"
          label="project.name"
          value={filterTextFieldValue('name')}
          onChange={onChangeStringFilter('name', CONTAINS_LOOKUP)}
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(BenefitPlanProjectsFilter)));
