import React from 'react';
import { useModulesManager, useTranslations, PublishedComponent } from '@openimis/fe-core';

function IntermediateIndicatorsFilter({
  filters, onChangeFilters,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);

  return (
    <div>
      <PublishedComponent
        pubRef="core.StringInput"
        value={filters.name}
        onChange={(value) => onChangeFilters([{ id: 'name', value }])}
        label={formatMessage('IntermediateIndicatorsFilter.name')}
      />
      <PublishedComponent
        pubRef="core.StringInput"
        value={filters.section}
        onChange={(value) => onChangeFilters([{ id: 'section', value }])}
        label={formatMessage('IntermediateIndicatorsFilter.section')}
      />
    </div>
  );
}

export default IntermediateIndicatorsFilter;
