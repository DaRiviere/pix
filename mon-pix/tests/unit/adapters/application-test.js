import { expect } from 'chai';
import { it, describe } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest('adapter:application', {
    needs: ['service:session']
  });

  it('should add header with authentication token ', function() {
    // Given
    const expectedToken = '23456789';
    const applicationAdapter = this.subject();

    // When
    applicationAdapter.set('session', { data: { authenticated: { token: expectedToken } } });

    expect(applicationAdapter.get('headers')).to.deep.equal({
      'Authorization': `Bearer ${expectedToken}`
    });
  });

  it('should allow to logout ', function() {
    // Given
    const applicationAdapter = this.subject();

    // Then
    expect(applicationAdapter.get('headers')).to.deep.equal({
      'Authorization': ''
    });
  });
});
