import { isEmpty } from '@ember/utils';
import $ from 'jquery';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import config from 'mon-pix/config/environment';

const FORM_CLOSED = 'FORM_CLOSED';
const FORM_OPENED = 'FORM_OPENED';
const FORM_SUBMITTED = 'FORM_SUBMITTED';

export default Component.extend({

  store: service(),

  classNames: ['feedback-panel'],

  assessment: null,
  challenge: null,
  collapsible: true,

  _status: FORM_CLOSED,
  _content: null,
  _error: null,

  isFormClosed: equal('_status', FORM_CLOSED),
  isFormOpened: equal('_status', FORM_OPENED),
  isFormSubmitted: equal('_status', FORM_SUBMITTED),

  didReceiveAttrs() {
    this._super(...arguments);
    this._reset();
  },

  _reset() {
    this.set('_content', null);
    this.set('_error', null);
    this.set('_status', this._getDefaultStatus());
  },

  _closeForm() {
    this.set('_status', FORM_CLOSED);
    this.set('_error', null);
  },

  _getDefaultStatus() {
    return this.collapsible ? FORM_CLOSED : FORM_OPENED;
  },

  _scrollToPanel: function() {
    $('html,body').animate({
      scrollTop: $('.feedback-panel__view').offset().top - 15
    }, config.APP.SCROLL_DURATION);
  },

  actions: {

    openFeedbackForm() {
      this.set('_status', FORM_OPENED);
      this._scrollToPanel();
    },

    cancelFeedback() {
      this._closeForm();
    },

    sendFeedback() {
      const content = this._content;
      if (isEmpty(content) || isEmpty(content.trim())) {
        this.set('_error', 'Vous devez saisir un message.');
        return;
      }

      const store = this.store;
      const assessment = this.assessment;
      const challenge = this.challenge;

      const feedback = store.createRecord('feedback', {
        content: this._content,
        assessment,
        challenge
      });
      feedback.save()
        .then(() => this.set('_status', FORM_SUBMITTED));
    }
  }
});
