const { expect, sinon, knex, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');
const BookshelfAssessment = require('../../../../lib/infrastructure/data/assessment');

describe('Integration | Infrastructure | Repositories | assessment-repository', () => {

  // TODO: rajouter la verif de l'ajout du profile dans le cas du SMART_PLACEMENT
  describe('#get', () => {

    let assessmentIdInDb;

    context('when the assessment exists', () => {

      beforeEach(() => {
        return knex('assessments')
          .insert({
            userId: 1,
            courseId: 'course_A',
            state: 'completed',
            createdAt: new Date('2016-10-27T08:44:25Z'),
          })
          .then((assessmentId) => {
            assessmentIdInDb = assessmentId[0];
            return knex('answers').insert([
              {
                value: '1,4',
                result: 'ko',
                challengeId: 'challenge_1_4',
                assessmentId: assessmentIdInDb,
                createdAt: new Date('2016-10-27T08:45:00Z'),
              }, {
                value: '2,8',
                result: 'ko',
                challengeId: 'challenge_2_8',
                assessmentId: assessmentIdInDb,
                createdAt: new Date('2016-10-27T08:45:30Z'),
              }, {
                value: '3,1',
                result: 'ko',
                challengeId: 'challenge_3_1',
                assessmentId: assessmentIdInDb,
                createdAt: new Date('2016-10-27T08:44:00Z'),
              },
              {
                value: '5,2',
                result: 'ko',
                challengeId: 'challenge_4',
                createdAt: new Date('2016-10-27T08:45:50Z'),
              },
            ]);
          });
      });

      afterEach(() => {
        return knex('assessments').delete()
          .then(() => knex('answers').delete());
      });

      it('should return the assessment with the answers sorted by creation date ', () => {
        // when
        const promise = assessmentRepository.get(assessmentIdInDb);

        // then
        return promise.then((assessment) => {
          expect(assessment).to.be.an.instanceOf(Assessment);
          expect(assessment.id).to.equal(assessmentIdInDb);
          expect(assessment.courseId).to.equal('course_A');

          expect(assessment.answers).to.have.lengthOf(3);
          expect(assessment.answers[0]).to.be.an.instanceOf(Answer);
          expect(assessment.answers[0].challengeId).to.equal('challenge_3_1');
          expect(assessment.answers[1].challengeId).to.equal('challenge_1_4');
          expect(assessment.answers[2].challengeId).to.equal('challenge_2_8');
        });
      });
    });

    context('when the assessment does not exist', () => {
      it('should return null', () => {
        // when
        const promise = assessmentRepository.get(245);

        // then
        return promise.then((assessment) => {
          expect(assessment).to.equal(null);
        });
      });
    });
  });

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;
    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
      createdAt: new Date('2018-10-27T08:44:25Z'),
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
      createdAt: new Date('2016-10-27T08:44:25Z'),
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      type: 'PLACEMENT',
      createdAt: new Date('2017-10-27T08:44:25Z'),
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      state: 'completed',
      type: 'PLACEMENT',
      createdAt: new Date('2017-10-27T08:44:25Z'),
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      state: 'completed',
      type: Assessment.types.CERTIFICATION,
      createdAt: new Date('2018-09-27T08:44:25Z'),
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      state: 'completed',
      type: 'DEMO',
      createdAt: new Date('2015-10-27T08:44:25Z'),
    }];

    beforeEach(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return only the last assessment (which are not Certifications) for each courses from JOHN', () => {
      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);

        const firstId = assessments[0].id;
        expect(firstId).to.equal(1);

        const secondId = assessments[1].id;
        expect(secondId).to.equal(4);
      });
    });

    it('should not return preview assessments', () => {
      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(LAYLA);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      sinon.stub(BookshelfAssessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        },
      });

      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });
    });
  });

  describe('#findCompletedAssessmentsByUserId', () => {

    const JOHN = 2;
    const LAYLA = 3;
    const COMPLETED_ASSESSMENT_A_ID = 1;
    const COMPLETED_ASSESSMENT_B_ID = 2;
    const UNCOMPLETE_ASSESSMENT_ID = 3;

    const assessmentsInDb = [{
      id: COMPLETED_ASSESSMENT_A_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: COMPLETED_ASSESSMENT_B_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: UNCOMPLETE_ASSESSMENT_ID,
      userId: JOHN,
      courseId: 'courseId',
      state: 'started',
      type: 'PLACEMENT',
    }, {
      id: 4,
      userId: LAYLA,
      courseId: 'courseId',
      state: 'completed',
      type: 'PLACEMENT',
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId',
      state: 'completed',
      type: Assessment.types.CERTIFICATION,
    }, {
      id: 6,
      userId: LAYLA,
      courseId: 'nullAssessmentPreview',
      state: 'completed',
      type: 'DEMO',
    }];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should return the list of assessments (which are not Certifications) from JOHN', () => {
      // when
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(JOHN);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(2);

        expect(assessments[0]).to.be.an.instanceOf(Assessment);
        expect(assessments[1]).to.be.an.instanceOf(Assessment);

        expect(assessments[0].id).to.equal(COMPLETED_ASSESSMENT_A_ID);
        expect(assessments[1].id).to.equal(COMPLETED_ASSESSMENT_B_ID);
      });
    });

    it('should not return preview assessments from LAYLA', () => {
      // when
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(LAYLA);

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.lengthOf(1);
      });
    });

    it('should throw an error if something went wrong', () => {
      //Given
      const error = new Error('Unable to fetch');
      sinon.stub(BookshelfAssessment, 'where').returns({
        fetchAll: () => {
          return Promise.reject(error);
        },
      });

      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(JOHN);

      // then
      return promise
        .catch((err) => {
          expect(err).to.equal(error);
        });
    });
  });

  describe('#getByUserIdAndAssessmentId', () => {

    describe('when userId is provided,', () => {
      const fakeUserId = 3;
      let assessmentId;
      const assessment =
        {
          userId: fakeUserId,
          courseId: 'courseId',
        };

      beforeEach(() => {
        return knex('assessments')
          .insert(assessment)
          .then((insertedAssessment) => {
            assessmentId = insertedAssessment.shift();
          });
      });

      afterEach(() => {
        return knex('assessments').delete();
      });

      it('should fetch relative assessment ', () => {
        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(assessmentId, fakeUserId);

        // then
        return promise.then((res) => {
          expect(res).to.be.an.instanceOf(Assessment);
          expect(res.id).to.equal(assessmentId);
          expect(res.userId).to.equal(fakeUserId);
        });
      });
    });

    describe('when userId is null,', () => {
      const fakeUserId = null;
      let assessmentId;
      const assessment =
        {
          userId: fakeUserId,
          courseId: 'courseId',
        };

      beforeEach(() => {
        return knex('assessments')
          .insert(assessment)
          .returning('id')
          .then((insertedAssessment) => {
            assessmentId = insertedAssessment.shift();
          });
      });

      afterEach(() => {
        return knex('assessments').delete();
      });

      it('should fetch relative assessment', () => {
        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(assessmentId, fakeUserId);

        // then
        return promise.then((res) => {
          expect(res).to.be.an.instanceOf(Assessment);
          expect(res.id).to.equal(assessmentId);
          expect(res.userId).to.equal(fakeUserId);
        });
      });
    });

  });

  describe('#findLastCompletedAssessmentsForEachCoursesByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;

    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: new Date('2017-11-08T11:47:38Z'),
      type: 'PLACEMENT',
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: new Date('2017-11-08T11:47:38Z'),
      type: 'PLACEMENT',
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: new Date('2017-11-08T12:47:38Z'),
      type: 'PLACEMENT',
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      state: 'completed',
      createdAt: new Date('2017-11-08T11:47:38Z'),
      type: 'PLACEMENT',
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      state: 'started',
      createdAt: new Date('2017-11-08T11:47:38Z'),
      type: 'PLACEMENT',
    }, {
      id: 6,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: new Date('2020-10-27T08:44:25Z'),
      type: 'PLACEMENT',
    },
    ];

    const assessmentResultsInDb = [{
      id: 1,
      assessmentId: 1,
      createdAt: new Date('2018-10-27T08:44:25Z'),
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 2,
      assessmentId: 2,
      createdAt: new Date('2017-11-08T18:00:00Z'),
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 3,
      assessmentId: 3,
      createdAt: new Date('2019-08-27T08:44:25Z'),
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 4,
      assessmentId: 4,
      createdAt: new Date('2020-10-27T08:44:25Z'),
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 5,
      assessmentId: 5,
      createdAt: new Date('2017-11-08T21:00:00Z'),
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 6,
      assessmentId: 6,
      createdAt: new Date('2020-10-27T20:00:00Z'),
      emitter: 'PIX',
      status: 'validated',
    },
    ];

    // TODO: test with malformed data, e.g.:
    // - completed assessments without an AssessmentResult

    before(() => {
      return knex('assessments').insert(assessmentsInDb)
        .then(() => knex('assessment-results').insert(assessmentResultsInDb));
    });

    after(() => {
      return knex('assessment-results').delete()
        .then(() => knex('assessments').delete());
    });

    it('should correctly query Assessment conditions', () => {
      // given
      const expectedAssessments = [
        Assessment.fromAttributes({
          id: 3,
          userId: JOHN,
          courseId: 'courseId1',
          state: 'completed',
          createdAt: new Date('2017-11-08T12:47:38Z'),
          type: 'PLACEMENT',
          campaignParticipation: null,
          assessmentResults: [
            {
              assessmentId: 3,
              commentForCandidate: null,
              commentForJury: null,
              commentForOrganization: null,
              createdAt: new Date('2019-08-27T08:44:25Z'),
              emitter: 'PIX',
              id: 3,
              juryId: null,
              level: null,
              pixScore: null,
              status: 'validated',
              competenceMarks: []
            }
          ]
        })
      ];

      // when
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(JOHN, new Date('2019-10-27T08:44:25Z'));

      // then
      return promise.then((assessments) => {
        expect(assessments).to.deep.equal(expectedAssessments);
      });
    });
  });

  describe('#save', () => {

    const JOHN = 2;
    const assessmentToBeSaved = Assessment.fromAttributes({
      userId: JOHN,
      courseId: 'courseId1',
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
      createdAt: new Date('2017-11-08T11:47:38Z'),
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', () => {
      // when
      const promise = assessmentRepository.save(assessmentToBeSaved);

      // then
      return promise.then((assessmentReturned) =>
        knex('assessments').where('id', assessmentReturned.id).first('id', 'userId'))
        .then((assessmentsInDb) => {
          expect(assessmentsInDb.userId).to.equal(JOHN);
        });
    });
  });

  describe('#getByCertificationCourseId', () => {

    const assessmentInDb = {
      courseId: 'course_A',
      state: 'completed',
      createdAt: new Date('2016-10-27T08:44:25Z'),
      type: 'CERTIFICATION',
    };

    const competenceMark = {
      level: 4,
      score: 35,
      area_code: '2',
      competence_code: '2.1',
    };

    const expectedAssessmentResult = {
      id: 12,
      level: 0,
      pixScore: 0,
      status: 'validated',
      emitter: 'PIX-ALGO',
      juryId: 1,
      commentForJury: 'Computed',
      commentForCandidate: 'Votre certification a été validé par Pix',
      commentForOrganization: 'Sa certification a été validé par Pix',
      competenceMarks: [],
      createdAt: new Date('2016-10-27T08:44:25Z'),
    };

    beforeEach(() => {
      return knex('assessments').insert(assessmentInDb)
        .then((assessmentIds) => {
          const assessmentId = _.first(assessmentIds);
          const result = {
            id: 12,
            level: 0,
            pixScore: 0,
            status: 'validated',
            emitter: 'PIX-ALGO',
            juryId: 1,
            commentForJury: 'Computed',
            commentForCandidate: 'Votre certification a été validé par Pix',
            commentForOrganization: 'Sa certification a été validé par Pix',
            createdAt: new Date('2016-10-27T08:44:25Z'),
          };
          result.assessmentId = assessmentId;
          expectedAssessmentResult.assessmentId = assessmentId;

          return knex('assessment-results').insert(result);
        })
        .then((resultIds) => {
          const resultId = _.first(resultIds);

          competenceMark.assessmentResultId = resultId;
          return knex('competence-marks').insert(competenceMark);
        });
    });

    afterEach(() => {
      return Promise.all([
        knex('assessments').delete(),
        knex('assessment-results').delete(),
        knex('competence-marks').delete(),
      ]);
    });

    it('should returns assessment results for the given certificationId', () => {
      // when

      const promise = assessmentRepository.getByCertificationCourseId('course_A');

      // then
      return promise.then((assessmentReturned) => {
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.courseId).to.equal('course_A');
        expect(assessmentReturned.pixScore).to.equal(assessmentInDb.pixScore);
        expect(assessmentReturned.assessmentResults).to.have.lengthOf(1);
        expect(assessmentReturned.assessmentResults[0]).to.deep.equal(expectedAssessmentResult);
      });
    });
  });

  describe('#findOneCertificationAssessmentByUserIdAndCourseId', () => {

    let assessmentsInDb;
    let answersInDb;

    beforeEach(() => {
      assessmentsInDb = [
        databaseBuilder.factory.buildAssessment({
          id: 1,
          courseId: 'courseId1',
          userId: 1,
          type: 'CERTIFICATION'
        }),
        databaseBuilder.factory.buildAssessment({
          id: 2,
          courseId: 'courseId1',
          userId: 2,
          type: 'CERTIFICATION',
        }),
        databaseBuilder.factory.buildAssessment({
          id: 3,
          courseId: 'courseId1',
          userId: 2,
          type: 'PLACEMENT',
        }),
        databaseBuilder.factory.buildAssessment({
          id: 4,
          courseId: 'courseId2',
          userId: 2,
          type: 'CERTIFICATION',
        }),
      ];

      answersInDb = [
        databaseBuilder.factory.buildAnswer({
          id: 1,
          assessmentId: 2
        }),
        databaseBuilder.factory.buildAnswer({
          id: 2,
          assessmentId: 2
        }),
      ];
      return Promise.all([
        knex('assessments').insert(assessmentsInDb),
        knex('answers').insert(answersInDb),
      ]);
    });

    afterEach(() => {
      return Promise.all([
        knex('assessments').delete(),
        knex('answers').delete()
      ]).then(() => databaseBuilder.clean());
    });

    it('should return assessment with answers when it matches with userId and courseId', function() {
      // given
      const userId = 2;
      const courseId = 'courseId1';

      // when
      const promise = assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return promise.then((assessment) => {
        expect(assessment.id).to.equal(2);
        expect(assessment.answers).to.have.lengthOf(2);
      });
    });

    it('should return null when it does not match with userId and courseId', function() {
      // given
      const userId = 234;
      const courseId = 'inexistantId';

      // when
      const promise = assessmentRepository.findOneCertificationAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return promise.then((assessment) => {
        expect(assessment).to.equal(null);
      });
    });
  });

  describe('#findSmartPlacementAssessmentsByUserId', () => {
    let assessmentId;

    beforeEach(() => {
      const assessmentInDb = databaseBuilder.factory.buildAssessment({
        courseId: 'course_A',
        userId: 1,
        type: 'SMART_PLACEMENT',
      });

      const campaign = databaseBuilder.factory.buildCampaign({
        name: 'Campagne',
      });

      return knex('assessments').insert(assessmentInDb)
        .then((assessmentIds) => {
          assessmentId = _.first(assessmentIds);
          return knex('campaigns').insert(campaign);
        })
        .then((campaignIds) => {
          const campaignId = _.first(campaignIds);
          return knex('campaign-participations').insert({ assessmentId, campaignId });
        });
    });

    afterEach(() => {
      return Promise.all([
        knex('assessments').delete(),
        knex('campaign-participations').delete(),
        knex('campaigns').delete(),
      ]);
    });

    it('should returns the assessment with campaign when it matches with userId', () => {
      // when
      const promise = assessmentRepository.findSmartPlacementAssessmentsByUserId(1);

      // then
      return promise.then((assessmentsReturned) => {
        expect(assessmentsReturned[0]).to.be.an.instanceOf(Assessment);
        expect(assessmentsReturned[0].id).to.equal(assessmentId);
        expect(assessmentsReturned[0].campaignParticipation.campaign.name).to.equal('Campagne');
      });
    });

    context('when assessment do not have campaign', () => {
      beforeEach(() => {
        return Promise.all([
          knex('campaign-participations').delete(),
          knex('campaigns').delete(),
        ]);
      });

      it('should returns the assessment without campaign when matches with userId', () => {
        // when
        const promise = assessmentRepository.findSmartPlacementAssessmentsByUserId(1);

        // then
        return promise.then((assessmentsReturned) => {
          expect(assessmentsReturned[0]).to.be.an.instanceOf(Assessment);
          expect(assessmentsReturned[0].id).to.equal(assessmentId);
          expect(assessmentsReturned[0].campaignParticipation).to.equal(null);
        });
      });
    });
  });

  describe('#findOneLastPlacementAssessmentByUserIdAndCourseId', () => {

    const userId = 42;
    const courseId = 'rec23kfr5hfD54f';

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return null if nothing found', async () => {
      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment).to.be.null;
    });

    it('should return a placement regarding the given userId', async () => {
      // given
      const otherUserId = 40;
      const userOlderAssessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-07-07T05:00:00Z')
      });

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId: otherUserId,
        courseId,
        createdAt: new Date('2018-09-09T05:00:00Z')
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment.id).to.deep.equal(userOlderAssessment.id);
    });

    it('should return a placement concerning the given courseId', async () => {
      // given
      const userOlderAssessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-07-07T05:00:00Z')
      });

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId: 'wrongRec',
        createdAt: new Date('2018-09-09T05:00:00Z')
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment.id).to.deep.equal(userOlderAssessment.id);
    });

    it('should return an assessment of type placement', async () => {
      // given
      const userOlderAssessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-07-07T05:00:00Z')
      });

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.SMARTPLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-09-09T05:00:00Z')
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment.id).to.deep.equal(userOlderAssessment.id);
    });

    it('should return the last placement concerning the userId and courseId', async () => {
      // given
      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-07-07T05:00:00Z')
      });

      const lastAssessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-09-09T05:00:00Z')
      });

      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-08-08T05:00:00Z')
      });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment.id).to.deep.equal(lastAssessment.id);

    });

    it('should fetch the related assessment results', async () => {
      // given
      const userAssessment = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PLACEMENT,
        userId,
        courseId,
        createdAt: new Date('2018-07-07T05:00:00Z'),
      });
      databaseBuilder.factory.buildAssessmentResult({ assessmentId: userAssessment.id });
      databaseBuilder.factory.buildAssessmentResult({ assessmentId: userAssessment.id });

      await databaseBuilder.commit();

      // when
      const foundAssessment = await assessmentRepository.findOneLastPlacementAssessmentByUserIdAndCourseId(userId, courseId);

      // then
      return expect(foundAssessment.assessmentResults).to.have.length.of(2);
    });
  });
});
