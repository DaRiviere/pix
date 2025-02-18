import Component from '@ember/component';
import { computed } from '@ember/object';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default Component.extend({

  classNames: ['qrocm-proposal'],

  proposals: null,
  answersValue: null,
  answerChanged: null, // action

  _blocks: computed('proposals', function() {
    return proposalsAsBlocks(this.proposals);
  }),

  didInsertElement: function() {
    this.$('input').keydown(() => {
      this.answerChanged();
    });
  }

});
