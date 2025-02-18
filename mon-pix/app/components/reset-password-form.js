import Component from '@ember/component';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.';
const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

const SUBMISSION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

export default Component.extend({
  _displaySuccessMessage: null,
  validation: VALIDATION_MAP['default'],
  urlHome: ENV.APP.HOME_HOST,

  actions: {
    validatePassword() {
      const password = this.get('user.password');
      const validationStatus = (isPasswordValid(password)) ? 'default' : 'error';
      this.set('validation', VALIDATION_MAP[validationStatus]);
    },

    handleResetPassword() {
      this.set('_displaySuccessMessage', false);
      return this.user.save()
        .then(() => {
          this.set('validation', SUBMISSION_MAP['default']);
          this.set('_displaySuccessMessage', true);
          this.set('user.password', null);
        })
        .catch(() => this.set('validation', SUBMISSION_MAP['error']));
    }
  }
});
