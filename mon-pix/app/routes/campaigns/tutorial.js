import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import campaignTutorial from 'mon-pix/static-data/campaign-tutorial';

export default Route.extend(AuthenticatedRouteMixin, {

  campaignCode: null,
  tutorialPageId: 0,
  tutorial: campaignTutorial.tutorial,

  _setupPaging(numberOfPages, currentTutorialPageId) {
    const classOfTutorialPages = new Array(numberOfPages);
    classOfTutorialPages[currentTutorialPageId] = 'dot__active';
    return classOfTutorialPages;
  },

  model(params) {
    this.set('campaignCode', params.campaign_code);
    const maxTutorialPageId = this.tutorial.length - 1;
    return {
      title: this.tutorial[this.tutorialPageId].title,
      icon: this.tutorial[this.tutorialPageId].icon,
      explanation: this.tutorial[this.tutorialPageId].explanation,
      showNextButton: this.tutorialPageId < maxTutorialPageId,
      paging: this._setupPaging(this.tutorial.length, this.tutorialPageId)
    };
  },

  actions: {
    submit() {
      this.set('tutorialPageId', 0);
      this.transitionTo('campaigns.start-or-resume', this.campaignCode, {
        queryParams: {
          hasSeenLanding: true,
          hasJustConsultedTutorial: true
        }
      });
    },

    next() {
      const nextTutorialPageId = this.tutorialPageId + 1;
      if (nextTutorialPageId < this.tutorial.length) {
        this.set('tutorialPageId', nextTutorialPageId);
        this.refresh();
      }
    }
  }
});
