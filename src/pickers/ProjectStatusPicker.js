import React from 'react';
import { ConstantBasedPicker } from '@openimis/fe-core';
import { PROJECT_STATUS_LIST } from '../constants';

function ProjectStatusPicker(props) {
  const {
    required, readOnly, onChange, value, withLabel,
  } = props;

  return (
    <ConstantBasedPicker
      module="socialProtection"
      label="project.statusPicker"
      constants={PROJECT_STATUS_LIST}
      required={required}
      withNull={false}
      readOnly={readOnly}
      onChange={onChange}
      value={value}
      withLabel={withLabel}
    />
  );
}

export default ProjectStatusPicker;
