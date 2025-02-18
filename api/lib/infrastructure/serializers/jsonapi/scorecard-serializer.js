const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(scorecard) {
    return new Serializer('scorecard', {
      attributes: [
        'name',
        'index',
        'courseId',
        'area',
        'earnedPix',
        'level',
        'pixScoreAheadOfNextLevel'
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title']
      }
    }).serialize(scorecard);
  },

};
