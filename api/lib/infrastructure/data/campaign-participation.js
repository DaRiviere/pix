const Bookshelf = require('../bookshelf');

require('./assessment');
require('./campaign');

module.exports = Bookshelf.model('CampaignParticipation', {

  tableName: 'campaign-participations',
  hasTimestamps: ['createdAt', null],

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  campaign() {
    return this.belongsTo('Campaign', 'campaignId');
  },

  user() {
    return this.belongsTo('User', 'userId');
  },

  parse(rawAttributes) {
    if (rawAttributes.sharedAt) {
      rawAttributes.sharedAt = new Date(rawAttributes.sharedAt);
    }

    return rawAttributes;
  },
});
