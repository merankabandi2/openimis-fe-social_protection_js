import React from 'react';
import { injectIntl } from 'react-intl';
import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { SelectInput, PublishedComponent, formatMessage } from '@openimis/fe-core';
import { defaultFilterStyles } from '../util/styles';
import BeneficiaryStatusPicker from '../pickers/BeneficiaryStatusPicker';

function BenefitPlanLocationsFilter({
  intl, classes, filters, onChangeFilters, readOnly, status,
}) {
  const any = formatMessage(intl, 'socialProtection', 'any');
  const filterValue = (filterName) => filters?.[filterName]?.value;

  return (
    <Grid container className={classes.form}>
      <Grid item xs={2} className={classes.item}>
        <SelectInput
          module="socialProtection"
          label="location.locationType.label"
          options={[
            { value: 'D', label: formatMessage(intl, 'location', 'locationType.0') },
            { value: 'W', label: formatMessage(intl, 'location', 'locationType.1') },
            { value: 'V', label: formatMessage(intl, 'location', 'locationType.2') },
          ]}
          value={filterValue('type')}
          onChange={(value) => onChangeFilters([
            {
              id: 'type',
              value,
              filter: `type: "${value}"`,
            },
          ])}
        />
      </Grid>

      <Grid item xs={2} className={classes.item}>
        <BeneficiaryStatusPicker
          label="beneficiary.beneficiaryStatusPicker"
          withNull
          readOnly={readOnly}
          nullLabel={any}
          value={status || filterValue('status')}
          onChange={(value) => onChangeFilters([
            {
              id: 'status',
              value,
              filter: `status: ${value}`,
            },
          ])}
        />
      </Grid>
      <Grid item xs={12}>
        <PublishedComponent
          pubRef="location.LocationFilter"
          withNull
          filters={filters}
          onChangeFilters={onChangeFilters}
          anchor="parentLocation"
        />
      </Grid>
    </Grid>
  );
}

export default injectIntl(withTheme(withStyles(defaultFilterStyles)(BenefitPlanLocationsFilter)));
