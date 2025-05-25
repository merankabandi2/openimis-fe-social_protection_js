import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import { withTheme, withStyles } from '@material-ui/core/styles';
import _ from 'lodash';

import {
  Autocomplete, withModulesManager, formatMessage,
} from '@openimis/fe-core';
import { fetchSections } from '../actions';

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

class SectionPicker extends Component {
  componentDidMount() {
    if (!this.props.fetchedSections) {
      // Initial load
      this.props.fetchSections({});
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, 'socialProtection', 'section.picker.none');

  formatOption = (option) => {
    if (!option) return '';
    return option.name;
  }

  onSectionChange = (section) => {
    if (this.props.onChange) {
      this.props.onChange(section);
    }
  }

  render() {
    const {
      intl, sections, fetchingSections, readOnly, value, className, required,
      withLabel = true, label, withPlaceholder = false, placeholder, withNull = false, reset,
    } = this.props;
    
    const pickerLabel = label || formatMessage(intl, 'socialProtection', 'section.label');

    return (
      <Autocomplete
        required={required}
        readOnly={readOnly}
        options={sections}
        isLoading={fetchingSections}
        value={value}
        getOptionLabel={this.formatOption}
        onChange={this.onSectionChange}
        filterOptions={(options, params) => {
          const { inputValue } = params;
          const filtered = options.filter((option) => option.name.toLowerCase().includes(inputValue.toLowerCase()));
          return filtered;
        }}
        className={className}
        label={withLabel ? pickerLabel : null}
        placeholder={withPlaceholder ? placeholder || pickerLabel : null}
        withNull={withNull}
        nullLabel={this.nullDisplay}
        reset={reset}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  sections: state.socialProtection.sections,
  fetchingSections: state.socialProtection.fetchingSections,
  fetchedSections: state.socialProtection.fetchedSections,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSections,
}, dispatch);

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(withTheme(withStyles(styles)(SectionPicker)))
  )
);
