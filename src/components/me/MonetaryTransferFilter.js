import React from 'react';
import { useModulesManager, useTranslations, PublishedComponent } from '@openimis/fe-core';

function MonetaryTransferFilter({
  filters, onChangeFilters,
}) {
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations('socialProtection', modulesManager);

  return (
    <div>
    </div>
  );
}

export default MonetaryTransferFilter;
