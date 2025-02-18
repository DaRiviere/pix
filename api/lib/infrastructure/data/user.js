const Bookshelf = require('../bookshelf');
const DomainUser = require('../../domain/models/User');
const DomainPixRole = require('../../domain/models/PixRole');
const BookshelfPixRole = require('./pix-role');
const BookshelfUserPixRole = require('./user-pix-role');

require('./assessment');
require('./organization');
require('./knowledge-element');
require('./membership');

module.exports = Bookshelf.model('User', {
  tableName: 'users',
  hasTimestamps: ['createdAt', 'updatedAt'],

  assessments() {
    return this.hasMany('Assessment');
  },

  knowledgeElements() {
    return this.hasMany('KnowledgeElement', 'userId');
  },

  /**
   * @deprecated Please use #organizationsAccesses() which also manages the access rights
   */
  organizations() {
    return this.hasMany('Organization', 'userId');
  },

  pixRoles() {
    return this.belongsToMany(BookshelfPixRole).through(BookshelfUserPixRole);
  },

  memberships() {
    return this.hasMany('Membership', 'userId');
  },

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'userId');
  },

  toDomainEntity() {
    const model = this.toJSON();
    if (model.pixRoles) {
      model.pixRoles = model.pixRoles.map((pixRoleJson) => new DomainPixRole(pixRoleJson));
    }
    model.cgu = Boolean(model.cgu);
    model.pixOrgaTermsOfServiceAccepted = Boolean(model.pixOrgaTermsOfServiceAccepted);
    model.pixCertifTermsOfServiceAccepted = Boolean(model.pixCertifTermsOfServiceAccepted);
    return new DomainUser(model);
  }

});
