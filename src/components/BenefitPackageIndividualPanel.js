import React from 'react';
import {
  Grid, Typography, IconButton, Tooltip,
} from '@material-ui/core';
import {
  FormattedMessage,
  PublishedComponent,
  TextInput,
  NumberInput,
  FormPanel,
  formatMessage,
} from '@openimis/fe-core';
import { Person } from '@material-ui/icons';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { EMPTY_STRING, RIGHT_INDIVIDUAL_UPDATE, FIELD_TYPES } from '../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  paper: theme.paper.paper,
  fullHeight: {
    height: '100%',
  },
});

function renderHeadPanelSubtitle(rights, intl, history, modulesManager, classes, individualUuid) {
  const openIndividual = () => history.push(`/${modulesManager.getRef('individual.route.individual')}`
    + `/${individualUuid}`);

  return (
    <Grid item>
      <Grid container align="center" justify="center" direction="column" className={classes.fullHeight}>
        <Grid item>
          <Typography>
            <FormattedMessage
              module="socialProtection"
              id="socialProtection.benefitPackage.IndividualDetailPanel.title"
            />
            { !!individualUuid && (
            <Tooltip title={formatMessage(intl, 'socialProtection', 'benefitPackage.IndividualDetailPanel.tooltip')}>
              <IconButton onClick={openIndividual} disabled={!rights.includes(RIGHT_INDIVIDUAL_UPDATE)}>
                <Person />
              </IconButton>
            </Tooltip>
            )}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

class BenefitPackageIndividualPanel extends FormPanel {
  // eslint-disable-next-line class-methods-use-this
  createAdditionalField(jsonExt) {
    if (!jsonExt) return [];

    const additionalFields = JSON.parse(jsonExt);

    return Object.entries(additionalFields).map(([property, value]) => {
      const field = { [property]: value };
      const fieldType = typeof value;
      return { fieldType, field };
    });
  }

  // eslint-disable-next-line class-methods-use-this
  renderProperType({ fieldType, field }) {
    const { 0: label, 1: value } = Object.entries(field)[0];

    if (fieldType === FIELD_TYPES.INTEGER || fieldType === FIELD_TYPES.NUMBER) {
      return (
        <NumberInput
          module="socialProtection"
          readOnly
          min={0}
          displayZero
          label={label}
          value={value}
        />
      );
    }

    return (
      <TextInput
        module="socialProtection"
        readOnly
        label={label}
        value={value}
      />
    );
  }

  render() {
    const {
      classes, readOnly, intl, history, modulesManager, rights,
      beneficiary: {
        individual, status, jsonExt,
      },
    } = this.props;
    const { uuid } = individual;

    const jsonExtFields = this.createAdditionalField(jsonExt);

    return (
      <>
        <Grid container className={classes.tableTitle}>
          {renderHeadPanelSubtitle(rights, intl, history, modulesManager, classes, uuid)}
        </Grid>
        <Grid container className={classes.item}>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="socialProtection"
              label="beneficiary.firstName"
              value={individual.firstName}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="socialProtection"
              label="beneficiary.lastName"
              value={individual.lastName}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="socialProtection"
              label="beneficiary.dob"
              value={individual.dob}
              readOnly={readOnly}
            />
          </Grid>
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="socialProtection"
              label="beneficiary.status"
              value={status ?? EMPTY_STRING}
              readOnly={readOnly}
            />
          </Grid>
          {jsonExtFields?.map((jsonExtField) => (
            <Grid item xs={3} className={classes.item}>
              {this.renderProperType(jsonExtField)}
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
}

export default injectIntl(withTheme(withStyles(styles)(BenefitPackageIndividualPanel)));