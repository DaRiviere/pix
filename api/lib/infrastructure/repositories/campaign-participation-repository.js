const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const User = require('../../domain/models/User');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const fp = require('lodash/fp');
const _ = require('lodash');

function _toDomain(bookshelfCampaignParticipation) {
  return new CampaignParticipation({
    id: bookshelfCampaignParticipation.get('id'),
    assessmentId: bookshelfCampaignParticipation.get('assessmentId'),
    assessment: new Assessment(bookshelfCampaignParticipation.related('assessment').toJSON()),
    campaign: new Campaign(bookshelfCampaignParticipation.related('campaign').toJSON()),
    campaignId: bookshelfCampaignParticipation.get('campaignId'),
    isShared: Boolean(bookshelfCampaignParticipation.get('isShared')),
    sharedAt: bookshelfCampaignParticipation.get('sharedAt'),
    createdAt: new Date(bookshelfCampaignParticipation.get('createdAt')),
    participantExternalId: bookshelfCampaignParticipation.get('participantExternalId'),
    userId: bookshelfCampaignParticipation.get('userId'),
    user: new User(bookshelfCampaignParticipation.related('user').toJSON()),
  });
}

module.exports = {

  async get(id, options) {
    const campaignParticipation = await queryBuilder.get(BookshelfCampaignParticipation, id, options, false);

    return _toDomain(campaignParticipation);
  },

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save()
      .then(_toDomain);
  },

  findByCampaignId(campaignId) {
    return BookshelfCampaignParticipation
      .where({ campaignId })
      .fetchAll({ withRelated: ['campaign'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  findByUserId(userId) {
    return BookshelfCampaignParticipation
      .where({ userId })
      .orderBy('createdAt', 'DESC')
      .fetchAll({ withRelated: ['campaign'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  find(options) {
    return queryBuilder.find(BookshelfCampaignParticipation, options);
  },

  // TODO: Replace this use-case specific version by adding inner-joins to query-builder
  findWithUsersPaginated(options) {
    return BookshelfCampaignParticipation
      .where(options.filter)
      .query((qb) => {
        qb.innerJoin('users', 'userId', 'users.id');
        qb.orderBy('users.lastName', 'asc');
      })
      .fetchPage({
        page: options.page.number,
        pageSize: options.page.size,
        withRelated: ['user']
      })
      .then((results) => {
        return {
          pagination: results.pagination,
          models: bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, results.models)
        };
      });
  },

  findWithCampaignParticipationResultsData(options) {
    return BookshelfCampaignParticipation
      .where(options.filter)
      .query((qb) => {
        qb.innerJoin('users', 'campaign-participations.userId', 'users.id');
        qb.orderBy('users.lastName', 'asc');
      })
      .fetchPage({
        page: options.page.number,
        pageSize: options.page.size,
        withRelated: ['user', 'assessment', 'user.knowledgeElements']
      })
      .then(({ models, pagination }) => {
        const campaignParticipations = bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, models);

        _.each(campaignParticipations, (campaignParticipation) => {
          const sortedUniqKnowlegeElements = _(campaignParticipation.user.knowledgeElements)
            .filter((ke) => ke.createdAt < campaignParticipation.sharedAt)
            .orderBy('createdAt', 'desc')
            .uniqBy('skillId')
            .value();

          campaignParticipation.user.knowledgeElements = sortedUniqKnowlegeElements;
        });

        return {
          pagination: pagination,
          models: campaignParticipations
        };
      });
  },

  updateCampaignParticipation(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation)
      .save({ isShared: true, sharedAt: new Date() }, { patch: true, require: true })
      .then(_toDomain)
      .catch(_checkNotFoundError);
  },

  count(filters = {}) {
    return BookshelfCampaignParticipation.where(filters).count();
  },
};

function _adaptModelToDb(campaignParticipation) {
  return {
    assessmentId: campaignParticipation.assessmentId,
    campaignId: campaignParticipation.campaignId,
    participantExternalId: campaignParticipation.participantExternalId,
    userId: campaignParticipation.userId,
  };
}

function _checkNotFoundError(err) {
  if (err instanceof BookshelfCampaignParticipation.NotFoundError) {
    throw new NotFoundError('Participation non trouvée');
  }
  throw err;
}
