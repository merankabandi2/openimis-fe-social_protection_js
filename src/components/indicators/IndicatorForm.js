import React from 'react';
import { injectIntl } from 'react-intl';

import { Grid } from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
  TextInput,
  NumberInput,
  TextAreaInput,
  PublishedComponent,
} from '@openimis/fe-core';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class IndicatorForm extends FormPanel {
  render() {
    const {
      edited,
      classes,
      readOnly,
    } = this.props;
    const indicator = { ...edited };

    return (
      <Grid container className={classes.item}>
        <Grid item xs={6} className={classes.item}>
          <PublishedComponent
            pubRef="socialProtection.SectionPicker"
            value={indicator?.section ?? null}
            required
            readOnly={readOnly}
            onChange={(section) => this.updateAttribute('section', section)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="indicator.name"
            required
            readOnly={readOnly}
            value={indicator?.name ?? ''}
            onChange={(name) => this.updateAttribute('name', name)}
          />
        </Grid>
        <Grid item xs={6} className={classes.item}>
          <TextInput
            module="socialProtection"
            label="indicator.pbc"
            readOnly={readOnly}
            value={indicator?.pbc ?? ''}
            onChange={(pbc) => this.updateAttribute('pbc', pbc)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="socialProtection"
            label="indicator.baseline"
            readOnly={readOnly}
            value={indicator?.baseline ?? 0}
            onChange={(baseline) => this.updateAttribute('baseline', baseline)}
          />
        </Grid>
        <Grid item xs={3} className={classes.item}>
          <NumberInput
            module="socialProtection"
            label="indicator.target"
            readOnly={readOnly}
            value={indicator?.target ?? 0}
            onChange={(target) => this.updateAttribute('target', target)}
          />
        </Grid>
        <Grid item xs={12} className={classes.item}>
          <TextAreaInput
            module="socialProtection"
            label="indicator.observation"
            readOnly={readOnly}
            value={indicator?.observation ?? ''}
            onChange={(observation) => this.updateAttribute('observation', observation)}
          />
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(IndicatorForm))));
