/* eslint-disable camelcase */
import React from 'react';
import { injectIntl } from 'react-intl';

import { withStyles, withTheme } from '@material-ui/core/styles';

import {
  FormPanel,
  withModulesManager,
} from '@openimis/fe-core';
import { CLEARED_STATE_FILTER } from '../../constants';

const styles = (theme) => ({
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: '100%',
  },
});

class MEResultFrameworkHeadPanel extends FormPanel {
  constructor(props) {
    super(props);
    this.state = {
      appliedCustomFilters: [CLEARED_STATE_FILTER],
      appliedFiltersRowStructure: [CLEARED_STATE_FILTER],
    };
  }

  componentDidMount() {
    this.setStateFromProps(this.props);
  }

  setStateFromProps = (props) => {
    const { jsonExt } = props?.edited ?? {};
    if (jsonExt) {
      const filters = this.getDefaultAppliedCustomFilters(jsonExt);
      this.setState({ appliedCustomFilters: filters, appliedFiltersRowStructure: filters });
    }
  };

  updateJsonExt = (value) => {
    this.updateAttributes({
      jsonExt: value,
    });
  };

  // eslint-disable-next-line class-methods-use-this
  getDefaultAppliedCustomFilters = (jsonExt) => {
    try {
      const jsonData = JSON.parse(jsonExt);
      const advancedCriteria = jsonData.advanced_criteria || [];
      const transformedCriteria = advancedCriteria.map(({ custom_filter_condition }) => {
        const [field, filter, typeValue] = custom_filter_condition.split('__');
        const [type, value] = typeValue.split('=');
        return {
          custom_filter_condition,
          field,
          filter,
          type,
          value,
        };
      });
      return transformedCriteria;
    } catch (error) {
      return [];
    }
  };

  setAppliedCustomFilters = (appliedCustomFilters) => {
    this.setState({ appliedCustomFilters });
  };

  setAppliedFiltersRowStructure = (appliedFiltersRowStructure) => {
    this.setState({ appliedFiltersRowStructure });
  };

  render() {
    return (
      <>

      </>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(MEResultFrameworkHeadPanel))));
