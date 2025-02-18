import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model(params) {
    return RSVP.hash({
      user: this.store.findRecord('user', this.get('session.data.authenticated.userId'), { reload: true }),
      certificationNumber: params.certification_number // FIXME certification number is a domain attribute and should not be queried as a technical id
    });
  }
});
