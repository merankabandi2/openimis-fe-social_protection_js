import React from 'react';
import { useModulesManager, useTranslations, PublishedComponent } from '@openimis/fe-core';

function SensitizationTrainingFilter({
  filters, onChangeFilters,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);

  return (
    <div>
      <PublishedComponent
        pubRef="location.LocationPicker"
        value={filters.location}
        onChange={(value) => onChangeFilters([{ id: 'location', value }])}
        label={formatMessage('MicroProjectFilter.location')}
      />
      <PublishedComponent
        pubRef="core.DatePicker"
        value={filters.report_date}
        onChange={(value) => onChangeFilters([{ id: 'report_date', value }])}
        label={formatMessage('MicroProjectFilter.report_date')}
      />
    </div>
  );
}

export default SensitizationTrainingFilter;
