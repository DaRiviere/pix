const { UserNotAuthorizedToAccessEntity } = require('../errors');

module.exports = ({ authenticatedUserId, requestedUserId, organizationRepository }) => {

  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  return organizationRepository.findByUserId(requestedUserId);

};
