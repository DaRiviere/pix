import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | compte', function() {
  setupTest('route:compte', {
    needs: ['service:session', 'service:metrics']
  });

  describe('model', function() {

    let storyStub;
    let findRecordStub;

    before(function() {
      findRecordStub = sinon.stub();
      storyStub = Service.extend({
        findRecord: findRecordStub
      });
    });

    it('should redirect to /board when the user as an organization', function() {
      // Given
      const linkedOrganization = EmberObject.create({ id: 1 });
      const foundUser = EmberObject.create({ organizations: [linkedOrganization] });

      this.register('service:store', storyStub);
      this.inject.service('store', { as: 'store' });

      findRecordStub.resolves(foundUser);
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.model();

      // Then
      return promise.then(function() {
        sinon.assert.calledWith(route.transitionTo, 'board');
      });
    });

    it('should remain on /compte when the user as no organization linked (with a forced data reload)', function() {
      // Given
      const foundUser = EmberObject.create({});

      this.register('service:store', storyStub);
      this.inject.service('store', { as: 'store' });

      findRecordStub.resolves(foundUser);
      const route = this.subject();
      route.transitionTo = sinon.stub();

      // When
      const promise = route.model();

      // Then
      return promise.then(function() {
        sinon.assert.notCalled(route.transitionTo);
        sinon.assert.calledWith(findRecordStub, 'user', undefined, { reload: true });
      });
    });

  });

  describe('#searchForOrganization', function() {

    let storeQueryStub;
    let storeStub;
    let organizations;
    let organizationCollectionStub;

    beforeEach(() => {
      organizationCollectionStub = sinon.stub();
      organizations = { get: organizationCollectionStub, content: [{}] };

      storeQueryStub = sinon.stub().resolves(organizations);
      storeStub = Service.extend({
        query: storeQueryStub
      });
    });

    it('should search for an organization', function() {
      // Given
      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });

      const route = this.subject();

      // When
      route.actions.searchForOrganization.call(route, 'RVSG44');

      // Then
      sinon.assert.calledOnce(storeQueryStub);
      sinon.assert.calledWith(storeQueryStub, 'organization', {
        code: 'RVSG44'
      });
    });

    describe('when there is only one result', () => {
      it('should return the organization', function() {
        // Given
        organizationCollectionStub.returns('THE FIRST OBJECT');

        this.register('service:store', storeStub);
        this.inject.service('store', { as: 'store' });
        const route = this.subject();

        // When
        const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

        return routeActionResult.then(function(organization) {
          expect(organization).to.equal('THE FIRST OBJECT');
        });
      });
    });

    describe('when there is no organization found', () => {
      it('should null', function() {
        // Given
        organizations.content = [];
        organizationCollectionStub.returns('THE FIRST OBJECT');

        this.register('service:store', storeStub);
        this.inject.service('store', { as: 'store' });
        const route = this.subject();

        // When
        const routeActionResult = route.actions.searchForOrganization.call(route, 'RVSG44');

        return routeActionResult.then(function(organization) {
          expect(organization).to.equal(null);
        });
      });
    });
  });

  describe('#shareProfileSnapshot', function() {

    let storeStub;
    let storeCreateRecordStub;
    let storeSaveStub;
    let organization;

    beforeEach(() => {
      storeSaveStub = sinon.stub().resolves();
      organization = EmberObject.create({ id: 1234, name: 'ACME', code: 'RVSG44', save: storeSaveStub });
      storeCreateRecordStub = sinon.stub().returns(organization);
      storeStub = Service.extend({
        createRecord: storeCreateRecordStub,
      });
    });

    it('should create and save a new Snapshot', function() {
      // given
      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });
      const route = this.subject();

      // when
      const promise = route.actions.shareProfileSnapshot.call(route, organization);

      // then
      return promise.then(function() {
        sinon.assert.called(storeCreateRecordStub);
        sinon.assert.called(storeSaveStub);
      });
    });
  });

});
