const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',
  hasTimestamps: ['createdAt', null],

  domainModelName: 'SmartPlacementKnowledgeElement',

  assessment() {
    return this.belongsTo('Assessment');
  },

  user() {
    return this.belongsTo('User');
  },

});
