import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  model() {
    return this.store.queryRecord('user', {}, { reload: true })
      .then((user) => {
        if (user.get('organizations.length') > 0) {
          return this.transitionTo('board');
        }
        return user;
      });
  },

  afterModel(model) {
    return model.hasMany('campaignParticipations').reload();
  },

  actions: {

    searchForOrganization(code) {
      return this.store.query('organization', { code })
        .then((organisations) => {
          const isOrganizationFound = organisations.content.length === 1;
          return isOrganizationFound ? organisations.get('firstObject') : null;
        });
    },

    shareProfileSnapshot(organization, studentCode, campaignCode) {
      return this.store.createRecord('snapshot', { organization, studentCode, campaignCode }).save();
    }
  }
});
