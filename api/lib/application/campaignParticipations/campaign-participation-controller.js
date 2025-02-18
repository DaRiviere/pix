const { BadRequestError } = require('../../infrastructure/errors');
const usecases = require('../../domain/usecases');
const tokenService = require('../../../lib/domain/services/token-service');

const smartPlacementAssessmentRepository = require('../../infrastructure/repositories/smart-placement-assessment-repository');
const campaignParticipationRepository = require('../../infrastructure/repositories/campaign-participation-repository');

const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/campaign-participation-serializer');

module.exports = {

  async getById(request) {
    const campaignParticipationId = request.params.id;
    const userId = request.auth.credentials.userId;
    const options = queryParamsUtils.extractParameters(request.query);

    const campaignParticipation = await usecases.getCampaignParticipation({
      campaignParticipationId, options, userId
    });

    return serializer.serialize(campaignParticipation);
  },

  async save(request, h) {
    const userId = request.auth.credentials.userId;
    const campaignParticipation = await serializer.deserialize(request.payload);
    const campaignParticipationDomain = await usecases.startCampaignParticipation({ campaignParticipation, userId });

    return h.response(serializer.serialize(campaignParticipationDomain)).created();
  },

  async find(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const options = queryParamsUtils.extractParameters(request.query);

    if (!options.filter.assessmentId && !options.filter.campaignId) {
      throw new BadRequestError('Campaign participations must be fetched by assessmentId and/or campaignId');
    }

    if (options.filter.campaignId && options.include.includes('campaign-participation-result')) {
      const { models: campaignParticipations, pagination } = await usecases.findCampaignParticipationsWithResults({ userId, options });
      return serializer.serialize(campaignParticipations, pagination, { ignoreCampaignParticipationResultsRelationshipData: false });

    } else {
      const { models: campaignParticipation, pagination } = await usecases.getUserCampaignParticipation({ userId, options });
      return serializer.serialize(campaignParticipation, pagination);
    }

  },

  shareCampaignResult(request) {
    const token = tokenService.extractTokenFromAuthChain(request.headers.authorization);
    const userId = tokenService.extractUserId(token);
    const campaignParticipationId = parseInt(request.params.id);

    return usecases.shareCampaignResult({
      userId,
      campaignParticipationId,
      campaignParticipationRepository,
      smartPlacementAssessmentRepository
    })
      .then(() => null);
  }
};
