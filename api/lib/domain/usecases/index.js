const _ = require('lodash');
const injectDefaults = require('../../infrastructure/utils/inject-defaults');

const dependencies = {
  answerRepository: require('../../infrastructure/repositories/answer-repository'),
  assessmentRepository: require('../../infrastructure/repositories/assessment-repository'),
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  campaignParticipationRepository: require('../../infrastructure/repositories/campaign-participation-repository'),
  campaignRepository: require('../../infrastructure/repositories/campaign-repository'),
  certificationChallengesService: require('../../domain/services/certification-challenges-service'),
  certificationCenterRepository: require('../../infrastructure/repositories/certification-center-repository'),
  certificationCenterMembershipRepository: require('../../infrastructure/repositories/certification-center-membership-repository'),
  certificationChallengeRepository: require('../../infrastructure/repositories/certification-challenge-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  certificationRepository: require('../../infrastructure/repositories/certification-repository'),
  challengeRepository: require('../../infrastructure/repositories/challenge-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  competenceTreeRepository: require('../../infrastructure/repositories/competence-tree-repository'),
  correctionRepository: require('../../infrastructure/repositories/correction-repository'),
  courseRepository: require('../../infrastructure/repositories/course-repository'),
  encryptionService: require('../../domain/services/encryption-service'),
  mailService: require('../../domain/services/mail-service'),
  membershipRepository: require('../../infrastructure/repositories/membership-repository'),
  organizationService: require('../../domain/services/organization-service'),
  organizationRepository: require('../../infrastructure/repositories/organization-repository'),
  resetPasswordService: require('../../domain/services/reset-password-service'),
  reCaptchaValidator: require('../../infrastructure/validators/grecaptcha-validator'),
  scoringService: require('../../domain/services/scoring/scoring-service'),
  settings: require('../../settings'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
  smartPlacementAssessmentRepository: require('../../infrastructure/repositories/smart-placement-assessment-repository'),
  smartPlacementKnowledgeElementRepository: require('../../infrastructure/repositories/smart-placement-knowledge-element-repository'),
  targetProfileRepository: require('../../infrastructure/repositories/target-profile-repository'),
  tokenService: require('../../domain/services/token-service'),
  userRepository: require('../../infrastructure/repositories/user-repository'),
  userService: require('../../domain/services/user-service'),
  sessionRepository: require('../../infrastructure/repositories/session-repository'),
  sessionService: require('../../domain/services/session-service'),
  snapshotsCsvConverter: require('../../infrastructure/converter/snapshots-csv-converter'),
  snapshotRepository: require('../../infrastructure/repositories/snapshot-repository'),
};

function injectDependencies(usecases) {
  return _.mapValues(usecases, _.partial(injectDefaults, dependencies));
}

module.exports = injectDependencies({
  acceptPixCertifTermsOfService: require('./accept-pix-certif-terms-of-service'),
  acceptPixOrgaTermsOfService: require('./accept-pix-orga-terms-of-service'),
  authenticateUser: require('./authenticate-user'),
  correctAnswerThenUpdateAssessment: require('./correct-answer-then-update-assessment'),
  createAssessmentForCampaign: require('./create-assessment-for-campaign'),
  createAssessmentForCertification: require('./create-assessment-for-certification'),
  createAssessmentResultForCompletedAssessment: require('./create-assessment-result-for-completed-assessment'),
  createCampaign: require('./create-campaign'),
  createCertificationCenterMembership: require('./create-certification-center-membership'),
  createMembership: require('./create-membership'),
  createOrganization: require('./create-organization.js'),
  createSession: require('./create-session'),
  createUser: require('./create-user'),
  findCertificationAssessments: require('./find-certification-assessments'),
  findCertificationCenters: require('./find-certification-centers'),
  findCompletedUserCertifications: require('./find-completed-user-certifications'),
  findOrganizations: require('./find-organizations'),
  findPlacementAssessments: require('./find-placement-assessments'),
  findSessionsForCertificationCenter: require('./find-sessions-for-certification-center'),
  findSmartPlacementAssessments: require('./find-smart-placement-assessments'),
  findSnapshots: require('./find-snapshots.js'),
  findUsers: require('./find-users.js'),
  getAssessment: require('./get-assessment'),
  getAttendanceSheet: require('./get-attendance-sheet'),
  getCampaign: require('./get-campaign'),
  getCampaignByCode: require('./get-campaign-by-code'),
  getCampaignParticipation: require('./get-campaign-participation'),
  getCampaignParticipationResult: require('./get-campaign-participation-result'),
  findCampaignParticipationsWithResults: require('./find-campaign-participations-with-results'),
  getCampaignReport: require('./get-campaign-report'),
  getCertificationCenter: require('./get-certification-center'),
  getCorrectionForAnswerWhenAssessmentEnded: require('./get-correction-for-answer-when-assessment-ended'),
  getNextChallengeForCertification: require('./get-next-challenge-for-certification'),
  getNextChallengeForDemo: require('./get-next-challenge-for-demo'),
  getNextChallengeForPlacement: require('./get-next-challenge-for-placement'),
  getNextChallengeForPreview: require('./get-next-challenge-for-preview'),
  getNextChallengeForSmartPlacement: require('./get-next-challenge-for-smart-placement'),
  getOrCreateSamlUser: require('./get-or-create-saml-user'),
  getOrganizationCampaigns: require('./get-organization-campaigns'),
  getOrganizationDetails: require('./get-organization-details.js'),
  getOrganizationMemberships: require('./get-organization-memberships'),
  getResultsCampaignInCSVFormat: require('./get-results-campaign-in-csv-format'),
  getSmartPlacementProgression: require('./get-smart-placement-progression'),
  getUserCampaignParticipation: require('./get-user-campaign-participation'),
  getUserCampaignParticipations: require('./get-user-campaign-participations'),
  getUserCertification: require('./get-user-certification'),
  getUserCertificationWithResultTree: require('./get-user-certification-with-result-tree'),
  getUserCertificationCenterMemberships: require('./get-user-certification-center-memberships'),
  getUserPixScore: require('./get-user-pix-score'),
  getUserScorecards: require('./get-user-scorecards'),
  getUserWithMemberships: require('./get-user-with-memberships'),
  preloadCacheEntries: require('./preload-cache-entries'),
  reloadCacheEntry: require('./reload-cache-entry'),
  removeAllCacheEntries: require('./remove-all-cache-entries'),
  retrieveLastOrCreateCertificationCourse : require('./retrieve-last-or-create-certification-course'),
  saveCertificationCenter: require('./save-certification-center'),
  shareCampaignResult: require('./share-campaign-result'),
  startCampaignParticipation: require('./start-campaign-participation'),
  startCompetenceEvaluation: require('./start-competence-evaluation'),
  startPlacementAssessment: require('./start-placement-assessment'),
  updateCampaign: require('./update-campaign'),
  updateCertification: require('./update-certification'),
  updateOrganizationInformation: require('./update-organization-information'),
  updateSession: require('./update-session'),
  updateUserPassword: require('./update-user-password'),
  writeOrganizationSharedProfilesAsCsvToStream: require('./write-organization-shared-profiles-as-csv-to-stream'),
});
