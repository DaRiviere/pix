import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {

  model() {
    return this.store.queryRecord('user', {})
      .then((user) => {
        if (user.get('organizations.length') <= 0) {
          return this.transitionTo('compte');
        }

        const organization = user.get('organizations.firstObject');

        return RSVP.hash({
          organization,
          snapshots: this.store.query('snapshot', {
            filter: {
              organizationId: organization.id,
            },
            page: {
              number: 1,
              size: 200,
            },
            sort: '-createdAt',
            include: 'user',
          }),
        });
      });
  }
});
