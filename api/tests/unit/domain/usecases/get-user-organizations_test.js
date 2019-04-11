const { expect, sinon, catchErr } = require('../../../test-helper');
const getUserOrganizations = require('../../../../lib/domain/usecases/get-user-organizations');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-user-organizations', () => {

  const userId = '1';
  let organizationRepository;

  beforeEach(() => {
    organizationRepository = {
      findByUserId: sinon.stub(),
    };
  });

  it('should find the user\'s organizations', async () => {
    // given
    organizationRepository.findByUserId.withArgs(userId).resolves('ok');

    // when
    const result = await getUserOrganizations({
      authenticatedUserId: userId,
      requestedUserId: userId,
      organizationRepository,
    });

    // then
    expect(result).to.equal('ok');
  });

  it('should throw a not authorized exception', async () => {
    // when
    const result = await catchErr(getUserOrganizations)({
      authenticatedUserId: userId,
      requestedUserId: 'otherId',
      organizationRepository,
    });

    // then
    expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

});
