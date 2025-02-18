const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../settings');
const passwordResetDemandRepository = require('../../infrastructure/repositories/reset-password-demands-repository');

module.exports = {
  generateTemporaryKey() {
    return jsonwebtoken.sign({
      data: settings.temporaryKey.payload
    }, settings.temporaryKey.secret, { expiresIn: settings.temporaryKey.tokenLifespan });
  },

  invalidOldResetPasswordDemand(userEmail) {
    return passwordResetDemandRepository.markAsBeingUsed(userEmail);
  },

  verifyDemand(temporaryKey) {
    return passwordResetDemandRepository
      .findByTemporaryKey(temporaryKey)
      .then((fetchedDemand) => fetchedDemand.toJSON());
  },

  hasUserAPasswordResetDemandInProgress(email) {
    return passwordResetDemandRepository.findByUserEmail(email);
  }
};
