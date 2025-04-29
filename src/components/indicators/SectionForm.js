import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
} from '@openimis/fe-core';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class SectionForm extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
    } = this.props;
    const section = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={12} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="section.name"
            required
            readOnly={readOnly}
            value={section?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(SectionForm))));
