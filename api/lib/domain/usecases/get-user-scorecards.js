const _ = require('lodash');
const { UserNotAuthorizedToAccessEntity } = require('../errors');

const MAX_REACHABLE_LEVEL = 5;
const NB_PIX_BY_LEVEL = 8;

module.exports = async ({ authenticatedUserId, requestedUserId, smartPlacementKnowledgeElementRepository, competenceRepository, competenceEvaluationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const [userKEList, competenceTree, competenceEvaluations] = await Promise.all([
    smartPlacementKnowledgeElementRepository.findUniqByUserId({ userId: requestedUserId, includeAssessments: false }),
    competenceRepository.list(),
    competenceEvaluationRepository.findByUserId(requestedUserId),
  ]);
  const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');

  return _.map(competenceTree, (competence) => {
    const KEgroup = sortedKEGroupedByCompetence[competence.id];
    const totalEarnedPixByCompetence = _.sumBy(KEgroup, 'earnedPix');

    return {
      id: `${requestedUserId}_${competence.index}`,
      name: competence.name,
      index: competence.index,
      area: competence.area,
      competenceId: competence.id,
      earnedPix: totalEarnedPixByCompetence,
      level: _getCompetenceLevel(totalEarnedPixByCompetence),
      pixScoreAheadOfNextLevel: _getPixScoreAheadOfNextLevel(totalEarnedPixByCompetence),
      status: _getStatus(KEgroup, competence.id, competenceEvaluations)
    };
  });
};

function _getCompetenceLevel(earnedPix) {
  const userLevel = Math.floor(earnedPix / NB_PIX_BY_LEVEL);
  return (userLevel >= MAX_REACHABLE_LEVEL) ? MAX_REACHABLE_LEVEL : userLevel;
}

function _getPixScoreAheadOfNextLevel(earnedPix) {
  return earnedPix % NB_PIX_BY_LEVEL;
}

function _getStatus(knowledgeElements, competenceId, competenceEvaluation) {
  if (_.isEmpty(knowledgeElements)) {
    return 'NOT_STARTED';
  }

  const competenceEvaluationForCompetence = _.find(competenceEvaluation, { competenceId });
  const stateOfAssessment = _.get(competenceEvaluationForCompetence, 'assessment.state');
  if (stateOfAssessment === 'completed') {
    return 'COMPLETED';
  }
  return 'STARTED';

}
