const _ = require('lodash');
const moment = require('moment');

const { ObjectValidationError } = require('../errors');

const TYPES_OF_ASSESSMENT_NEEDING_USER = ['PLACEMENT', 'CERTIFICATION'];

const MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS = 7;

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
};

const types = {
  PLACEMENT: 'PLACEMENT',
  SMARTPLACEMENT: 'SMART_PLACEMENT',
  CERTIFICATION: 'CERTIFICATION',
  DEMO: 'DEMO',
  PREVIEW: 'PREVIEW',
};

/*
 * Traduction : Évaluation
 */
class Assessment {

  /*
   * TODO: changer the Object.assign en quelque chose de plus expressif
   * Complétez la liste des attributs de la classe Assessment
   *
   * id: String,
   * course : associatedCourse (Class Course)
   * createdAt: Date
   * user: ? (class User ?)
   * successRate: 24, ?? Je ne sais pas ce que c'est
   * type: 'charade', String ?
   * state: String
   */
  constructor({
    id,
    // attributes
    createdAt,
    state,
    type,
    // includes
    answers = [],
    assessmentResults = [],
    campaignParticipation,
    course,
    targetProfile,
    // references
    courseId,
    userId,
  } = {}) {
    this.id = id;
    // attributes
    this.createdAt = createdAt;
    this.state = state;
    this.type = type;
    // includes
    this.answers = answers;
    this.assessmentResults = assessmentResults;
    this.campaignParticipation = campaignParticipation;
    this.course = course;
    this.targetProfile = targetProfile;
    // references
    this.courseId = courseId;
    this.userId = userId;
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const assessment = new Assessment();
    return Object.assign(assessment, attributes);
  }

  isCompleted() {
    return this.state === Assessment.states.COMPLETED;
  }

  getLastAssessmentResult() {
    if (this.assessmentResults && this.assessmentResults.length > 0) {
      return _(this.assessmentResults).sortBy(['createdAt']).last();
    }
    return null;
  }

  getPixScore() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().pixScore;
    }
    return null;
  }

  getLevel() {
    if (this.getLastAssessmentResult()) {
      return this.getLastAssessmentResult().level;
    }
    return null;
  }

  setCompleted() {
    this.state = Assessment.states.COMPLETED;
  }

  start() {
    this.state = Assessment.states.STARTED;
  }

  validate() {
    if (TYPES_OF_ASSESSMENT_NEEDING_USER.includes(this.type) && !this.userId) {
      return Promise.reject(new ObjectValidationError(`Assessment ${this.type} needs an User Id`));
    }
    return Promise.resolve();
  }

  isPreview() {
    return this.type === types.PREVIEW;
  }

  isDemo() {
    return this.type === types.DEMO;
  }

  isSmartPlacement() {
    return this.type === types.SMARTPLACEMENT;
  }

  isCertification() {
    return this.type === types.CERTIFICATION;
  }

  isPlacement() {
    return this.type === types.PLACEMENT;
  }

  canBeScored() {
    return (this.isPlacement() || this.isCertification()) && this.isCompleted();
  }

  isCertifiable() {
    return this.getLastAssessmentResult().level >= 1;
  }

  canStartNewAttemptOnCourse() {
    if (!this.isPlacement()) throw new Error('Only available for a placement assessment');

    return this.isCompleted() && this.getRemainingDaysBeforeNewAttempt() <= 0;
  }

  getRemainingDaysBeforeNewAttempt() {
    const lastResult = this.getLastAssessmentResult();
    const daysSinceLastCompletedAssessment = moment.utc().diff(lastResult.createdAt, 'days', true);

    const remainingDaysToWait = Math.ceil(MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS - daysSinceLastCompletedAssessment);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }

}

Assessment.states = states;
Assessment.types = types;
Assessment.MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS = MINIMUM_DELAY_IN_DAYS_BETWEEN_TWO_PLACEMENTS;

module.exports = Assessment;
