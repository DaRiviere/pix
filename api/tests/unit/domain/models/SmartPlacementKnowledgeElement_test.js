const { expect, domainBuilder } = require('../../../test-helper');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

describe('Unit | Domain | Models | SmartPlacementKnowledgeElement', () => {

  describe('#isValidated', () => {

    it('should be true if status validated', () => {
      // given
      const knowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.true;
    });

    it('should be false if status not validated', () => {
      // given
      const knowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isValidated = knowledgeElement.isValidated;

      // then
      expect(isValidated).to.be.false;
    });
  });

  describe('#isInValidated', () => {

    it('should be true if status invalidated', () => {
      // given
      const knowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.true;
    });

    it('should be false if status not invalidated', () => {
      // given
      const knowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
      });

      // when
      const isInvalidated = knowledgeElement.isInvalidated;

      // then
      expect(isInvalidated).to.be.false;
    });
  });

  describe('#createKnowledgeElementsForAnswer', () => {

    const userId = 3;

    context('when the challenge has one skill', () => {

      let challenge;
      let easierSkill;
      let harderSkill;
      let muchEasierSkill;
      let muchHarderSkill;
      let skill;
      let invalidAnswer;
      let validAnswer;

      beforeEach(() => {
        // given
        [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        challenge = domainBuilder.buildChallenge({ skills: [skill] });
        validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skill is not in the target profile', () => {

        let otherSkill;
        let createdKnowledgeElements;

        beforeEach(() => {
          // given
          otherSkill = domainBuilder.buildSkill();

          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [otherSkill],
            userId
          });
        });

        it('should not create any knowledge elements', () => {
          // then
          expect(createdKnowledgeElements).to.deep.equal([]);
        });
      });

      context('and the skill is in the target profil and is alone in it’s tube', () => {

        let createdKnowledgeElements;
        let targetSkills;

        beforeEach(() => {
          // given
          targetSkills = [skill];

          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills,
            userId
          });
        });

        it('should create a knowledge element', () => {
          // then
          const directKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            earnedPix: skill.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skill.id,
            userId: 3,
            competenceId: skill.competenceId
          });
          directKnowledgeElement.id = undefined;

          expect(createdKnowledgeElements).to.deep.equal([directKnowledgeElement]);
        });
      });

      context('and the skill is in the target profil and has other skills in it’s tube', () => {

        let targetSkills;

        beforeEach(() => {
          // given
          targetSkills = [muchEasierSkill, easierSkill, skill, harderSkill, muchHarderSkill];
        });

        context('and the answer is correct', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              createdAt:undefined,
              userId
            });
          });

          it('should create one direct knowledge element and two inferred validated for easier skills', () => {
            // then
            const directKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: skill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skill.id,
              createdAt:undefined,
              userId,
              competenceId: skill.competenceId
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForEasierSkill = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkill.id,
              createdAt:undefined,
              userId,
              competenceId: easierSkill.competenceId
            });
            inferredKnowledgeElementForEasierSkill.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkill = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkill.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkill.id,
              createdAt:undefined,
              userId,
              competenceId: muchEasierSkill.competenceId
            });
            inferredKnowledgeElementForMuchEasierSkill.id = undefined;
            const expectedKnowledgeElements = [
              directKnowledgeElement,
              inferredKnowledgeElementForMuchEasierSkill,
              inferredKnowledgeElementForEasierSkill,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });

        context('and the answer is incorrect', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              createdAt:undefined,
              userId
            });
          });

          it('should create one direct knowledge element and two inferred invalidated for harder skills', () => {
            // then
            const directKnowledgeElement = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skill.id,
              userId,
              competenceId: skill.competenceId
            });
            directKnowledgeElement.id = undefined;
            const inferredKnowledgeElementForHarderSkill = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkill.id,
              userId,
              competenceId: harderSkill.competenceId
            });
            inferredKnowledgeElementForHarderSkill.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkill = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkill.id,
              userId,
              competenceId: muchHarderSkill.competenceId
            });
            inferredKnowledgeElementForMuchHarderSkill.id = undefined;
            const expectedKnowledgeElements = [
              directKnowledgeElement,
              inferredKnowledgeElementForHarderSkill,
              inferredKnowledgeElementForMuchHarderSkill,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });
      });
    });

    context('when the challenge has multiple skills', () => {

      let challenge;
      let easierSkillFromTube1;
      let easierSkillFromTube2;
      let easierSkillFromTube3;
      let harderSkillFromTube1;
      let harderSkillFromTube2;
      let harderSkillFromTube3;
      let muchEasierSkillFromTube1;
      let muchEasierSkillFromTube2;
      let muchEasierSkillFromTube3;
      let muchHarderSkillFromTube1;
      let muchHarderSkillFromTube2;
      let muchHarderSkillFromTube3;
      let skillFromTube1;
      let skillFromTube2;
      let skillFromTube3;
      let invalidAnswer;
      let validAnswer;

      beforeEach(() => {
        // given
        [muchEasierSkillFromTube1,
          easierSkillFromTube1,
          skillFromTube1,
          harderSkillFromTube1,
          muchHarderSkillFromTube1,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube2,
          easierSkillFromTube2,
          skillFromTube2,
          harderSkillFromTube2,
          muchHarderSkillFromTube2,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });
        [muchEasierSkillFromTube3,
          easierSkillFromTube3,
          skillFromTube3,
          harderSkillFromTube3,
          muchHarderSkillFromTube3,
        ] = domainBuilder.buildSkillCollection({
          minLevel: 1,
          maxLevel: 5,
        });

        challenge = domainBuilder.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
        validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        invalidAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.KO });
      });

      context('and the skills are alone in their tube but one of those skill is not in the target profile', () => {

        let createdKnowledgeElements;

        beforeEach(() => {
          // when
          createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
            answer: validAnswer,
            challenge: challenge,
            previouslyValidatedSkills: [],
            previouslyFailedSkills: [],
            targetSkills: [skillFromTube1, skillFromTube3],
            userId
          });
        });

        it('should create knowledge elements for the other skills that are in the target profile', () => {
          // then
          const directKnowledgeElementFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            earnedPix: skillFromTube1.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube1.id,
            userId,
            competenceId: skillFromTube1.competenceId
          });
          directKnowledgeElementFromTube1.id = undefined;
          const directKnowledgeElementFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            earnedPix: skillFromTube3.pixValue,
            answerId: validAnswer.id,
            assessmentId: validAnswer.assessmentId,
            skillId: skillFromTube3.id,
            userId,
            competenceId: skillFromTube3.competenceId
          });
          directKnowledgeElementFromTube3.id = undefined;
          const expectedKnowledgeElements = [directKnowledgeElementFromTube1, directKnowledgeElementFromTube3];

          expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
        });
      });

      context('and the skills has other skills in their tube', () => {

        let targetSkills;

        beforeEach(() => {
          targetSkills = [
            easierSkillFromTube1,
            easierSkillFromTube2,
            easierSkillFromTube3,
            harderSkillFromTube1,
            harderSkillFromTube2,
            harderSkillFromTube3,
            muchEasierSkillFromTube1,
            muchEasierSkillFromTube2,
            muchEasierSkillFromTube3,
            muchHarderSkillFromTube1,
            muchHarderSkillFromTube2,
            muchHarderSkillFromTube3,
            skillFromTube1,
            skillFromTube2,
            skillFromTube3,
          ];
        });

        context('and the answer is correct', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: validAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              userId
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for easier skills', () => {
            const directKnowledgeElementFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube1.id,
              userId,
              competenceId: skillFromTube1.competenceId
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube1.id,
              userId,
              competenceId: easierSkillFromTube1.competenceId
            });
            inferredKnowledgeElementForEasierSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube1.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube1.id,
              userId,
              competenceId: muchEasierSkillFromTube1.competenceId
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube2.id,
              userId,
              competenceId: skillFromTube2.competenceId
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube2.id,
              userId,
              competenceId: easierSkillFromTube2.competenceId
            });
            inferredKnowledgeElementForEasierSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube2.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube2.id,
              userId,
              competenceId: muchEasierSkillFromTube2.competenceId
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: skillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: skillFromTube3.id,
              userId,
              competenceId: skillFromTube3.competenceId
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForEasierSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: easierSkillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: easierSkillFromTube3.id,
              userId,
              competenceId: easierSkillFromTube3.competenceId
            });
            inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchEasierSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
              earnedPix: muchEasierSkillFromTube3.pixValue,
              answerId: validAnswer.id,
              assessmentId: validAnswer.assessmentId,
              skillId: muchEasierSkillFromTube3.id,
              userId,
              competenceId: muchEasierSkillFromTube3.competenceId
            });
            inferredKnowledgeElementForMuchEasierSkillFromTube3.id = undefined;

            const expectedKnowledgeElements = [
              directKnowledgeElementFromTube1,
              directKnowledgeElementFromTube2,
              directKnowledgeElementFromTube3,
              inferredKnowledgeElementForEasierSkillFromTube1,
              inferredKnowledgeElementForMuchEasierSkillFromTube1,
              inferredKnowledgeElementForEasierSkillFromTube2,
              inferredKnowledgeElementForMuchEasierSkillFromTube2,
              inferredKnowledgeElementForEasierSkillFromTube3,
              inferredKnowledgeElementForMuchEasierSkillFromTube3,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });

        context('and the answer is incorrect', () => {

          let createdKnowledgeElements;

          beforeEach(() => {
            // when
            createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
              answer: invalidAnswer,
              challenge: challenge,
              previouslyValidatedSkills: [],
              previouslyFailedSkills: [],
              targetSkills,
              userId
            });
          });

          it('should create the three direct knowledge elements' +
            ' and the six inferred validated for harder skills', () => {
            const directKnowledgeElementFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube1.id,
              userId,
              competenceId: skillFromTube1.competenceId
            });
            directKnowledgeElementFromTube1.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube1.id,
              userId,
              competenceId: harderSkillFromTube1.competenceId
            });
            inferredKnowledgeElementForHarderSkillFromTube1.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube1.id,
              userId,
              competenceId: muchHarderSkillFromTube1.competenceId
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube1.id = undefined;

            const directKnowledgeElementFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube2.id,
              userId,
              competenceId: skillFromTube2.competenceId
            });
            directKnowledgeElementFromTube2.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube2.id,
              userId,
              competenceId: harderSkillFromTube2.competenceId
            });
            inferredKnowledgeElementForHarderSkillFromTube2.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube2.id,
              userId,
              competenceId: muchHarderSkillFromTube2.competenceId
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube2.id = undefined;

            const directKnowledgeElementFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: skillFromTube3.id,
              userId,
              competenceId: skillFromTube3.competenceId
            });
            directKnowledgeElementFromTube3.id = undefined;
            const inferredKnowledgeElementForHarderSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: harderSkillFromTube3.id,
              userId,
              competenceId: harderSkillFromTube3.competenceId
            });
            inferredKnowledgeElementForHarderSkillFromTube3.id = undefined;
            const inferredKnowledgeElementForMuchHarderSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
              source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
              status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
              earnedPix: 0,
              answerId: invalidAnswer.id,
              assessmentId: invalidAnswer.assessmentId,
              skillId: muchHarderSkillFromTube3.id,
              userId,
              competenceId: muchHarderSkillFromTube3.competenceId
            });
            inferredKnowledgeElementForMuchHarderSkillFromTube3.id = undefined;

            const expectedKnowledgeElements = [
              directKnowledgeElementFromTube1,
              directKnowledgeElementFromTube2,
              directKnowledgeElementFromTube3,
              inferredKnowledgeElementForHarderSkillFromTube1,
              inferredKnowledgeElementForMuchHarderSkillFromTube1,
              inferredKnowledgeElementForHarderSkillFromTube2,
              inferredKnowledgeElementForMuchHarderSkillFromTube2,
              inferredKnowledgeElementForHarderSkillFromTube3,
              inferredKnowledgeElementForMuchHarderSkillFromTube3,
            ];

            expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
          });
        });
      });
    });

    context('when some skills are already assessed', () => {

      context('and the challenge has multiple skills', () => {

        let challenge;
        let easierSkillFromTube1;
        let easierSkillFromTube2;
        let easierSkillFromTube3;
        let harderSkillFromTube1;
        let harderSkillFromTube2;
        let harderSkillFromTube3;
        let muchEasierSkillFromTube1;
        let muchEasierSkillFromTube2;
        let muchEasierSkillFromTube3;
        let muchHarderSkillFromTube1;
        let muchHarderSkillFromTube2;
        let muchHarderSkillFromTube3;
        let skillFromTube1;
        let skillFromTube2;
        let skillFromTube3;
        let validAnswer;

        beforeEach(() => {
          // given
          [muchEasierSkillFromTube1,
            easierSkillFromTube1,
            skillFromTube1,
            harderSkillFromTube1,
            muchHarderSkillFromTube1,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube2,
            easierSkillFromTube2,
            skillFromTube2,
            harderSkillFromTube2,
            muchHarderSkillFromTube2,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });
          [muchEasierSkillFromTube3,
            easierSkillFromTube3,
            skillFromTube3,
            harderSkillFromTube3,
            muchHarderSkillFromTube3,
          ] = domainBuilder.buildSkillCollection({
            minLevel: 1,
            maxLevel: 5,
          });

          challenge = domainBuilder.buildChallenge({ skills: [skillFromTube1, skillFromTube2, skillFromTube3] });
          validAnswer = domainBuilder.buildAnswer({ challengeId: challenge.id, result: AnswerStatus.OK });
        });

        context('and the skills has other skills in their tube', () => {

          let targetSkills;

          beforeEach(() => {
            targetSkills = [
              easierSkillFromTube1,
              easierSkillFromTube2,
              easierSkillFromTube3,
              harderSkillFromTube1,
              harderSkillFromTube2,
              harderSkillFromTube3,
              muchEasierSkillFromTube1,
              muchEasierSkillFromTube2,
              muchEasierSkillFromTube3,
              muchHarderSkillFromTube1,
              muchHarderSkillFromTube2,
              muchHarderSkillFromTube3,
              skillFromTube1,
              skillFromTube2,
              skillFromTube3,
            ];
          });

          context('and the answer is correct', () => {

            let createdKnowledgeElements;

            beforeEach(() => {
              // when
              createdKnowledgeElements = SmartPlacementKnowledgeElement.createKnowledgeElementsForAnswer({
                answer: validAnswer,
                challenge: challenge,
                previouslyValidatedSkills: [easierSkillFromTube1, muchEasierSkillFromTube1],
                previouslyFailedSkills: [easierSkillFromTube2],
                targetSkills,
                userId,
              });
            });

            it('should create the three direct knowledge elements' +
              ' and the three inferred validated for easier skills than are not evaluated', () => {
              const directKnowledgeElementFromTube1 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube1.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube1.id,
                userId,
                competenceId: skillFromTube1.competenceId
              });
              directKnowledgeElementFromTube1.id = undefined;

              const directKnowledgeElementFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube2.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube2.id,
                userId,
                competenceId: skillFromTube2.competenceId
              });
              directKnowledgeElementFromTube2.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube2 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: muchEasierSkillFromTube2.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube2.id,
                userId,
                competenceId: muchEasierSkillFromTube2.competenceId
              });
              inferredKnowledgeElementForMuchEasierSkillFromTube2.id = undefined;

              const directKnowledgeElementFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: skillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: skillFromTube3.id,
                userId,
                competenceId: skillFromTube3.competenceId
              });
              directKnowledgeElementFromTube3.id = undefined;
              const inferredKnowledgeElementForEasierSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: easierSkillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: easierSkillFromTube3.id,
                userId,
                competenceId: easierSkillFromTube3.competenceId
              });
              inferredKnowledgeElementForEasierSkillFromTube3.id = undefined;
              const inferredKnowledgeElementForMuchEasierSkillFromTube3 = domainBuilder.buildSmartPlacementKnowledgeElement({
                source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
                status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
                earnedPix: muchEasierSkillFromTube3.pixValue,
                answerId: validAnswer.id,
                assessmentId: validAnswer.assessmentId,
                skillId: muchEasierSkillFromTube3.id,
                userId,
                competenceId: muchEasierSkillFromTube3.competenceId

              });
              inferredKnowledgeElementForMuchEasierSkillFromTube3.id = undefined;

              const expectedKnowledgeElements = [
                directKnowledgeElementFromTube1,
                directKnowledgeElementFromTube2,
                directKnowledgeElementFromTube3,
                inferredKnowledgeElementForMuchEasierSkillFromTube2,
                inferredKnowledgeElementForEasierSkillFromTube3,
                inferredKnowledgeElementForMuchEasierSkillFromTube3,
              ];

              expect(createdKnowledgeElements).to.deep.equal(expectedKnowledgeElements);
            });
          });
        });
      });
    });
  });
});
