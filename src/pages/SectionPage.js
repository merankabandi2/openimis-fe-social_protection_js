import React, { useState, useRef, useEffect } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { makeStyles } from '@material-ui/styles';
import DeleteIcon from '@material-ui/icons/Delete';

import {
  Form,
  useHistory,
  useModulesManager,
  useTranslations,
  coreConfirm,
  clearConfirm,
  journalize,
} from '@openimis/fe-core';
import {
  clearSection,
  createSection,
  deleteSection,
  fetchSection,
  updateSection,
} from '../actions';
import {
  MODULE_NAME,
  RIGHT_SECTION_CREATE,
  RIGHT_SECTION_UPDATE,
} from '../constants';
import { ACTION_TYPE } from '../reducer';
import { mutationLabel, pageTitle } from '../util/string-utils';
import SectionForm from '../components/indicators/SectionForm';

const useStyles = makeStyles((theme) => ({
  page: theme.page,
  lockedPage: theme.page.locked,
}));

function SectionPage({
  clearSection,
  createSection,
  deleteSection,
  updateSection,
  sectionId,
  fetchSection,
  rights,
  confirmed,
  submittingMutation,
  mutation,
  section,
  coreConfirm,
  clearConfirm,
}) {
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const history = useHistory();
  const { formatMessage, formatMessageWithValues } = useTranslations(MODULE_NAME, modulesManager);

  const [editedSection, setEditedSection] = useState({});
  const [confirmedAction, setConfirmedAction] = useState(() => null);
  const prevSubmittingMutationRef = useRef();
  const pageLocked = editedSection?.isDeleted;

  const back = () => history.goBack();

  useEffect(() => {
    if (sectionId) {
      fetchSection([`id: "${sectionId}"`]);
    }
  }, [sectionId]);

  useEffect(() => {
    if (confirmed) confirmedAction();
    return () => confirmed && clearConfirm(null);
  }, [confirmed]);

  useEffect(() => {
    if (prevSubmittingMutationRef.current && !submittingMutation) {
      journalize(mutation);
      if (mutation?.actionType === ACTION_TYPE.DELETE_SECTION) {
        back();
      }
    }
  }, [submittingMutation]);

  useEffect(() => {
    prevSubmittingMutationRef.current = submittingMutation;
  });

  useEffect(() => setEditedSection(section), [section]);

  useEffect(() => () => clearSection(), []);

  const mandatoryFieldsEmpty = () => {
    if (
      editedSection?.name
      && !editedSection?.isDeleted) return false;
    return true;
  };

  const canSave = () => !mandatoryFieldsEmpty();

  const handleSave = () => {
    if (section?.id) {
      updateSection(
        editedSection,
        formatMessageWithValues('section.mutation.updateLabel', mutationLabel(section)),
      );
    } else {
      createSection(
        editedSection,
        formatMessageWithValues('section.mutation.createLabel', mutationLabel(section)),
      );
    }
    back();
  };

  const deleteSectionCallback = () => deleteSection(
    section,
    formatMessageWithValues('section.mutation.deleteLabel', mutationLabel(section)),
  );

  const openDeleteSectionConfirmDialog = () => {
    setConfirmedAction(() => deleteSectionCallback);
    coreConfirm(
      formatMessageWithValues('section.delete.confirm.title', pageTitle(section)),
      formatMessage('section.delete.confirm.message'),
    );
  };

  const actions = [
    !!sectionId && !pageLocked && {
      doIt: openDeleteSectionConfirmDialog,
      icon: <DeleteIcon />,
      tooltip: formatMessage('tooltip.delete'),
    },
  ];

  const canViewPage = sectionId 
    ? rights.includes(RIGHT_SECTION_UPDATE) 
    : rights.includes(RIGHT_SECTION_CREATE);

  if (!canViewPage) {
    return (
      <div className={classes.page}>
        <h3>You don't have permission to {sectionId ? 'edit' : 'create'} sections</h3>
        <p>Required right: {sectionId ? RIGHT_SECTION_UPDATE : RIGHT_SECTION_CREATE}</p>
        <p>Your rights: {rights.join(', ')}</p>
      </div>
    );
  }

  return (
    <div className={pageLocked ? classes.lockedPage : null}>
      <div className={classes.page}>
        <Form
          module="socialProtection"
          title={formatMessageWithValues('SectionPage.title', pageTitle(section))}
          titleParams={pageTitle(section)}
          openDirty
          edited={editedSection}
          onEditedChanged={setEditedSection}
          back={back}
          mandatoryFieldsEmpty={mandatoryFieldsEmpty}
          canSave={canSave}
          save={handleSave}
          HeadPanel={SectionForm}
          readOnly={pageLocked}
          rights={rights}
          actions={actions}
          setConfirmedAction={setConfirmedAction}
          saveTooltip={formatMessage('tooltip.save')}
        />
      </div>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  clearSection,
  createSection,
  deleteSection,
  updateSection,
  fetchSection,
  coreConfirm,
  clearConfirm,
  journalize,
}, dispatch);

const mapStateToProps = (state, props) => ({
  sectionId: props.match.params.section_id,
  rights: state.core?.user?.i_user?.rights ?? [],
  confirmed: state.core.confirmed,
  submittingMutation: state.socialProtection.submittingMutation,
  mutation: state.socialProtection.mutation,
  section: state.socialProtection.section,
});

export default connect(mapStateToProps, mapDispatchToProps)(SectionPage);
