import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl } from 'react-intl';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
} from '@material-ui/core';
import { withTheme, withStyles } from '@material-ui/core/styles';

import {
  withModulesManager,
  TextAreaInput,
  NumberInput,
  PublishedComponent,
  formatMessage,
} from '@openimis/fe-core';
import {
  createIndicatorAchievement,
  updateIndicatorAchievement,
} from '../../actions';

const styles = (theme) => ({
  item: theme.paper.item,
});

function IndicatorAchievementDialog({
  achievement, onClose, intl, modulesManager, createIndicatorAchievement, updateIndicatorAchievement, classes,
}) {
  const [edited, setEdited] = useState(achievement || {});

  useEffect(() => {
    setEdited(achievement || {});
  }, [achievement]);

  const handleSave = () => {
    const operation = achievement?.id
      ? updateIndicatorAchievement
      : createIndicatorAchievement;

    operation(
      edited,
      formatMessage(intl, 'socialProtection', achievement?.id
        ? 'indicatorAchievement.update.mutationLabel'
        : 'indicatorAchievement.create.mutationLabel'),
    );
    onClose(true);
  };

  const canSave = () => edited.achieved !== undefined && edited.achieved !== null && edited.date;

  const updateAttribute = (attribute, value) => {
    setEdited({ ...edited, [attribute]: value });
  };

  return (
    <Dialog open onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>
        {formatMessage(intl, 'socialProtection', achievement?.id
          ? 'indicatorAchievement.edit.title'
          : 'indicatorAchievement.add.title')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6} className={classes.item}>
            <PublishedComponent
              pubRef="core.DatePicker"
              module="socialProtection"
              label="indicatorAchievement.date"
              required
              value={edited.date}
              onChange={(v) => updateAttribute('date', v)}
            />
          </Grid>
          <Grid item xs={6} className={classes.item}>
            <NumberInput
              module="socialProtection"
              label="indicatorAchievement.achieved"
              required
              value={edited.achieved}
              onChange={(v) => updateAttribute('achieved', v)}
            />
          </Grid>
          <Grid item xs={12} className={classes.item}>
            <TextAreaInput
              module="socialProtection"
              label="indicatorAchievement.comment"
              value={edited.comment || ''}
              onChange={(v) => updateAttribute('comment', v)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="primary">
          {formatMessage(intl, 'socialProtection', 'dialog.cancel')}
        </Button>
        <Button onClick={handleSave} color="primary" disabled={!canSave()}>
          {formatMessage(intl, 'socialProtection', 'dialog.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  createIndicatorAchievement,
  updateIndicatorAchievement,
}, dispatch);

export default injectIntl(
  withModulesManager(
    connect(null, mapDispatchToProps)(
      withTheme(withStyles(styles)(IndicatorAchievementDialog))
    )
  )
);
