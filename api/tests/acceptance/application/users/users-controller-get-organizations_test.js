const createServer = require('../../../../server');
const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const _ = require('lodash');

describe('Acceptance | API | Campaign Participation Result', () => {

  let user, server, options;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    _.times(3, () => {
      return databaseBuilder.factory.buildOrganization({
        userId: user.id,
      });
    });
    databaseBuilder.factory.buildOrganization({
      userId: 'otherUserId',
    });

    await databaseBuilder.commit();

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/organizations`,
      headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
    };
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('GET /api/campaign-participations/{id}/campaign-participation-result', () => {

    it('should return the user\'s organizations', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(3);
    });
  });
});
