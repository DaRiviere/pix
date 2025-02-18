const createServer = require('../../../server');
const Assessment = require('../../../lib/domain/models/Assessment');
const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../test-helper');

describe('Acceptance | API | Campaign Participations', () => {

  let user;
  let options;
  let assessment;
  let campaign;
  let campaignParticipation;

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  beforeEach(() => {
    user = databaseBuilder.factory.buildUser();
    assessment = databaseBuilder.factory.buildAssessment({ userId: user.id, type: Assessment.types.SMARTPLACEMENT });
  });

  describe('GET /api/campaign-participations/{id}', () => {

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        assessmentId: assessment.id,
        campaign,
        campaignId: campaign.id,
        userId: user.id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaign-participation', async () => {
      // given
      options = {
        method: 'GET',
        url: `/api/campaign-participations/${campaignParticipation.id}?include=user`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
      };
      const expectedCampaignParticipation = {
        id: campaignParticipation.id.toString(),
        type: 'campaign-participations',
        'attributes': {
          'created-at': campaignParticipation.createdAt,
          'is-shared': campaignParticipation.isShared,
          'participant-external-id': campaignParticipation.participantExternalId,
          'shared-at': campaignParticipation.sharedAt,
        },
        relationships: {
          campaign: {
            data: null
          },
          user: {
            data: {
              id: `${user.id}`,
              type: 'users',
            }
          },
          assessment: {
            links: {
              related: `/assessments/${assessment.id}`
            }
          },
          'campaign-participation-result': {
            links: {
              related: `/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
            }
          },
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedCampaignParticipation);
    });
  });

  describe('GET /api/campaign-participations?filter[assessmentId]={id}', () => {

    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign();
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: true,
        assessmentId: assessment.id,
        campaignId: campaign.id,
        userId: user.id
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    context('when the user own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}&include=campaign,user`,
          headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        };
      });

      it('should return the campaign-participation of the given assessmentId', () => {
        // given
        const expectedCampaignParticipation = [
          {
            attributes: {
              'created-at': campaignParticipation.createdAt,
              'is-shared': Number(campaignParticipation.isShared),
              'participant-external-id': campaignParticipation.participantExternalId,
              'shared-at': campaignParticipation.sharedAt,
            },
            id: campaignParticipation.id.toString(),
            type: 'campaign-participations',
            relationships: {
              campaign: {
                data: {
                  type: 'campaigns',
                  id: campaign.id.toString()
                }
              },
              user: {
                data: {
                  id: user.id.toString(),
                  type: 'users'
                }
              },
              assessment: {
                links: {
                  related: `/assessments/${assessment.id}`
                }
              },
              'campaign-participation-result': {
                links: {
                  'related': `/campaign-participations/${campaignParticipation.id}/campaign-participation-result`
                }
              }
            }
          }
        ];

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.be.deep.equal(expectedCampaignParticipation);
        });
      });

    });

    context('when the user doesnt own the campaign participation', () => {

      beforeEach(() => {
        options = {
          method: 'GET',
          url: `/api/campaign-participations?filter[assessmentId]=${assessment.id}`,
          headers: { authorization: 'USER_UNATHORIZED' },
        };
      });

      it('it should reply an unauthorized error', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((error) => {
          expect(error.statusCode).to.equal(401);
        });
      });
    });
  });

  describe('PATCH /api/campaign-participations/{id}', () => {

    beforeEach(async () => {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: false,
        sharedAt: null,
        assessmentId: assessment.id,
      });

      options = {
        method: 'PATCH',
        url: `/api/campaign-participations/${campaignParticipation.id}`,
        headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        payload: {
          data: {
            isShared: true
          }
        },
      };
      await databaseBuilder.commit();

    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should allow user to share his campaign participation', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(204);
        expect(response.result).to.be.null;
      });
    });
  });

  describe('POST /api/campaign-participations', () => {

    const campaignId = 132435;
    const options = {
      method: 'POST',
      url: '/api/campaign-participations',
      headers: { authorization: generateValidRequestAuhorizationHeader() },
      payload: {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': 'iuqezfh13736',
          },
          relationships: {
            'campaign': {
              data: {
                id: campaignId,
                type: 'campaigns',
              }
            }
          }
        }
      }
    };

    beforeEach(async () => {
      databaseBuilder.factory.buildCampaign({ id: campaignId });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return 201 and the campaign participation when it has been successfully created', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });

    it('should return 404 error if the campaign related to the participation does not exist', () => {
      // given
      options.payload.data.relationships.campaign.data.id = null;

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
