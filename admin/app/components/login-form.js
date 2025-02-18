import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

  // dependencies
  session: service(),

  // properties
  identification: null,
  password: null,
  errorMessage: null,

  // interactions
  actions: {
    authenticateUser() {
      const scope = 'pix-admin';
      let { identification, password } = this;
      this.session.authenticate('authenticator:oauth2', identification, password, scope).catch((response) => {
        if (response && response.errors && response.errors.length > 0) {
          const firstError = response.errors[0];
          switch (firstError.status) {
            case '401':
              this.set('errorMessage', 'Identifiants de connexion invalides.');
              break;
            case '400':
              this.set('errorMessage', 'Syntaxe (de requête) invalide.');
              break;
            default:
              this.set('errorMessage', 'Un problème est survenu.');
              break;
          }
        }
      });
    }

  }

});
