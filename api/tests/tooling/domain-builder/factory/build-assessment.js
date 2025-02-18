const faker = require('faker');
const Assessment = require('../../../../lib/domain/models/Assessment');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');

const buildAnswer = require('./build-answer');
const buildCourse = require('./build-course');
const buildAssessmentResult = require('./build-assessment-result');
const buildKnowledgeElement = require('./build-smart-placement-knowledge-element');
const buildTargetProfile = require('./build-target-profile');
const buildCampaignParticipation = require('./build-campaign-participation');

function buildAssessment({
  id = faker.random.number(),
  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  type = Assessment.types.CERTIFICATION,
  state = Assessment.states.COMPLETED,
  course = buildCourse({ id: 'courseId' }),
  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
  campaignParticipation = null,
} = {}) {

  return new Assessment({
    // attributes
    id,
    courseId,
    createdAt,
    userId,
    type,
    state,

    // relationships
    answers,
    assessmentResults,
    course,
    campaignParticipation,
  });
}

buildAssessment.ofTypeSmartPlacement = function({
  id = faker.random.number(),

  courseId = 'courseId',
  createdAt = new Date('1992-06-12T01:02:03Z'),
  userId = faker.random.number(),
  state = Assessment.states.COMPLETED,

  answers = [buildAnswer()],
  assessmentResults = [buildAssessmentResult()],
  course = buildCourse({ id: 'courseId' }),
  targetProfile = buildTargetProfile(),
  knowledgeElements = [buildKnowledgeElement()],
  campaignParticipation = buildCampaignParticipation(),
} = {}) {
  return new SmartPlacementAssessment({
    // attributes
    id,
    courseId,
    createdAt,
    userId,
    type: Assessment.types.SMARTPLACEMENT,
    state,

    // relationships
    answers,
    assessmentResults,
    course,
    targetProfile,
    knowledgeElements,
    campaignParticipation
  });
};

module.exports = buildAssessment;
