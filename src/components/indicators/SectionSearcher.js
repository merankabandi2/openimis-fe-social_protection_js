import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect, useSelector } from 'react-redux';

import { IconButton, Tooltip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import {
  Searcher,
  useHistory,
  useModulesManager,
  useTranslations,
  clearConfirm,
  coreConfirm,
  journalize,
} from '@openimis/fe-core';
import { fetchSections, deleteSection } from '../../actions';
import { RIGHT_SECTION_SEARCH, RIGHT_SECTION_UPDATE, SECTION_ROUTE } from '../../constants';
import { ACTION_TYPE } from '../../reducer';

function SectionSearcher({
  fetchSections,
  fetchingSections,
  fetchedSections,
  errorSections,
  deleteSection,
  sections,
  coreConfirm,
  clearConfirm,
  sectionsPageInfo,
  sectionsTotalCount,
  confirmed,
  submittingMutation,
  mutation,
}) {
  const history = useHistory();
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations('socialProtection', modulesManager);
  const rights = useSelector((store) => store.core.user.i_user.rights ?? []);

  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [deletedSectionIds, setDeletedSectionIds] = useState([]);
  const [filters, setFilters] = useState({
    name: null,
  });
  const prevSubmittingMutationRef = useRef();

  const openDeleteSectionConfirmDialog = () => {
    coreConfirm(
      formatMessage('section.delete.confirm.title'),
      formatMessageWithValues('section.delete.confirm.message', { name: sectionToDelete.name }),
    );
  };

  useEffect(() => sectionToDelete && openDeleteSectionConfirmDialog(), [sectionToDelete]);

  useEffect(() => {
    if (sectionToDelete && confirmed) {
      deleteSection(
        sectionToDelete,
        formatMessageWithValues('section.mutation.deleteLabel', { name: sectionToDelete.name }),
      );
      setDeletedSectionIds([...deletedSectionIds, sectionToDelete.id]);
    }
    if (sectionToDelete && confirmed !== null) {
      setSectionToDelete(null);
    }
    return () => confirmed && clearConfirm(false);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  const headers = () => [
    'section.name',
    'emptyLabel',
  ];

  const sorts = () => [
    ['name', true],
  ];

  const fetchData = (params) => fetchSections(modulesManager, params);

  const rowIdentifier = (section) => section.id;

  const openSection = (section) => rights.includes(RIGHT_SECTION_SEARCH) && history.push(
    `/${modulesManager.getRef(SECTION_ROUTE)}/${section?.id}`,
  );

  const onDelete = (section) => setSectionToDelete(section);

  const itemFormatters = () => [
    (section) => section.name,
    (section) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Tooltip title={formatMessage('tooltip.edit')}>
          <IconButton
            onClick={() => openSection(section)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        {rights.includes(RIGHT_SECTION_UPDATE) && (
          <Tooltip title={formatMessage('tooltip.delete')}>
            <IconButton
              onClick={() => onDelete(section)}
              disabled={deletedSectionIds.includes(section.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    ),
  ];

  const onDoubleClick = (section) => openSection(section);

  const sectionFilter = ({ filters, onChangeFilters }) => {
    return (
      <div style={{ padding: '16px' }}>
        <div>
          <label>{formatMessage('section.name')}</label>
          <input 
            type="text" 
            value={filters.name || ''} 
            onChange={(e) => onChangeFilters({ ...filters, name: e.target.value })}
            style={{ marginLeft: '8px' }}
          />
        </div>
      </div>
    );
  };

  const defaultFilters = () => ({});

  const isRowDisabled = (_, section) => deletedSectionIds.includes(section.id);

  return (
    <Searcher
      module="socialProtection"
      fetch={fetchData}
      items={sections}
      itemsPageInfo={sectionsPageInfo}
      fetchedItems={!fetchingSections}
      fetchingItems={fetchingSections}
      errorItems={errorSections}
      tableTitle={formatMessageWithValues('section.searcherResultsTitle', { count: sectionsTotalCount ?? 0 })}
      headers={headers}
      itemFormatters={itemFormatters}
      sorts={sorts}
      rowIdentifier={rowIdentifier}
      onDoubleClick={onDoubleClick}
      defaultFilters={defaultFilters()}
      rowDisabled={isRowDisabled}
      rowLocked={isRowDisabled}
      FilterPane={sectionFilter}
    />
  );
}

const mapStateToProps = (state) => ({
  rights: state.core?.user?.i_user?.rights ?? [],
  sections: state.socialProtection.sections,
  sectionsPageInfo: state.socialProtection.sectionsPageInfo,
  fetchingSections: state.socialProtection.fetchingSections,
  errorSections: state.socialProtection.errorSections,
  sectionsTotalCount: state.socialProtection.sectionsTotalCount,
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchSections,
  deleteSection,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SectionSearcher);
