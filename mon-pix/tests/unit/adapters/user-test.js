import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest('adapter:user', {
    needs: ['service:session']
  });

  describe('#queryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.subject();
      adapter.ajax = sinon.stub().resolves();
    });

    it('should return a resolved promise', function(done) {
      // when
      const promise = adapter.queryRecord();
      // then
      promise.then(done);
    });

    it('should called GET /api/users/me', function() {
      // when
      adapter.queryRecord();

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me');
    });

  });

});
