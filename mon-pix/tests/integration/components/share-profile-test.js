import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';
import $ from 'jquery';

describe('Integration | Component | share profile', function() {

  setupComponentTest('share-profile', {
    integration: true,
  });

  function expectToBeOnOrganizationCodeEntryView() {
    expect($('.share-profile__section--organization-code-entry')).to.have.lengthOf(1);
    expect($('.share-profile__section--sharing-confirmation')).to.have.lengthOf(0);
    expect($('.share-profile__section--success-notification')).to.have.lengthOf(0);
  }

  function expectToBeSharingConfirmationView() {
    expect($('.share-profile__section--organization-code-entry')).to.have.lengthOf(0);
    expect($('.share-profile__section--sharing-confirmation')).to.have.lengthOf(1);
    expect($('.share-profile__section--success-notification')).to.have.lengthOf(0);
  }

  function expectToBeOnSuccessNotificationView() {
    expect($('.share-profile__section--organization-code-entry')).to.have.lengthOf(0);
    expect($('.share-profile__section--sharing-confirmation')).to.have.lengthOf(0);
    expect($('.share-profile__section--success-notification')).to.have.lengthOf(1);
  }

  function expectModalToBeClosed() {
    expect($('.pix-modal')).to.have.lengthOf(0);
  }

  describe('Step 0 - "Share" button on modal wrapper', function() {

    it('should open profile sharing modal on "organization code entry" view', async function() {
      // given
      this.render(hbs`{{share-profile}}`);
      expect(document.querySelectorAll('.pix-modal-dialog')).to.have.lengthOf(0);

      // when
      await document.querySelector(('.share-profile__share-button')).click();

      // then
      expect(document.querySelectorAll('.pix-modal-dialog')).to.have.lengthOf(1);
      expect(document.querySelectorAll('.share-profile__section--organization-code-entry')).to.have.lengthOf(1);
    });
  });

  describe('Step 1 - "Organization code entry" view', function() {

    it('should be the modal default view', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should contain a text input for the organization code', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect($('.share-profile__organization-code-input')).to.have.lengthOf(1);
    });

    it('should contain a "Continue" button to find the organization', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect($('.share-profile__continue-button')).to.have.lengthOf(1);
    });

    it('should contain a "Cancel" button to cancel the profile sharing', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect($('.share-profile__cancel-button')).to.have.lengthOf(1);
    });

    it('should redirect to "sharing confirmation" view when clicking on "Continue" button', async function() {
      // given
      this.set('searchForOrganization', () => {
        const organization = EmberObject.create({ name: 'Pix' });
        return RSVP.resolve(organization);
      });
      this.render(hbs`{{share-profile _showingModal=true _code="ABCD01" searchForOrganization=searchForOrganization}}`);

      // when
      await document.querySelector('.share-profile__continue-button').click();

      // then
      expectToBeSharingConfirmationView();
    });

    it('should display an error message when no organization was found for the given code', async function() {
      // given
      this.set('searchForOrganization', function() {
        return RSVP.resolve(null);
      });
      this.render(hbs`{{share-profile _showingModal=true searchForOrganization=searchForOrganization}}`);

      // when
      await document.querySelector('.share-profile__continue-button').click();

      // then
      expect($('.share-profile__form-error')).to.have.lengthOf(1);
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should close the modal when clicking on "Cancel" button', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // when
      await document.querySelector('.share-profile__cancel-button').click();

      // then
      expectModalToBeClosed();
    });

  });

  describe('Step 2 - "Sharing confirmation" view', function() {

    it('should display the name of the found organization', function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));

      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect($('.share-profile__organization-name').text().trim()).to.equal('Pix');
    });

    describe('when organization\'s type is SUP', function() {

      beforeEach(function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'SUP' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should ask for student code (required)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.exist;
      });

      it('should ask for campaign code (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    describe('when organization\'s type is SCO', function() {

      beforeEach(function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'SCO' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should not ask for student code', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.not.exist;
      });

      it('should ask for campaign code', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    describe('when organization\'s type is PRO', function() {

      beforeEach(function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'PRO' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should ask for ID-Pix (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.exist;
      });

      it('should ask for campaign code (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    it('should contain a "Confirm" button to valid the profile sharing', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect($('.share-profile__confirm-button')).to.have.lengthOf(1);
    });

    it('should contain a "Cancel" button to cancel the profile sharing for the given organization', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect($('.share-profile__cancel-button')).to.have.lengthOf(1);
    });

    it('should return back to "organization code entry" view when clicking on "Cancel" button', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // when
      await document.querySelector('.share-profile__cancel-button').click();

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should create a Snapshot and send it to the organization previously found when clicking on "Continue" button', async function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));
      this.set('shareProfileSnapshot', () => {
        return RSVP.resolve(null);
      });
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization shareProfileSnapshot=shareProfileSnapshot}}`);

      // when
      await document.querySelector('.share-profile__confirm-button').click();

      // then
      expectToBeOnSuccessNotificationView();
    });

    it('should limit the lenght of the campainCode to 255 characters', function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));

      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(document.querySelector('.share-profile__campaign-code-input').getAttribute('maxlength')).to.equal('255');

    });

    it('should limit the lenght of the studentCode to 255 characters', function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix', type: 'SUP' }));

      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(document.querySelector('.share-profile__student-code-input').getAttribute('maxlength')).to.equal('255');

    });

  });

  describe('Step 3 - "Success notification" view', function() {

    it('should contain a "Close" button that hide the modal', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // then
      expect($('.share-profile__close-button')).to.have.lengthOf(1);
    });

    it('should close the modal when clicking on "Cancel" button', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // when
      await document.querySelector('.share-profile__close-button').click();

      // then
      expect($('.pix-modal')).to.have.lengthOf(0);
    });
  });

  describe('Borderline cases', function() {

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "sharing confirmation" view', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);
      await document.querySelector('.pix-modal__close-link > a').click();

      // when
      await document.querySelector('.share-profile__share-button').click();

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "success notification" view', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);
      await document.querySelector('.pix-modal__close-link > a').click();

      // when
      await document.querySelector('.share-profile__share-button').click();

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should display the code input filled with the previously set organization code even after canceling sharing (step 2)', async function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _code="ORGA00" _view="sharing-confirmation"}}`);

      // when
      await document.querySelector('.share-profile__cancel-button').click();

      // then
      expect($('.share-profile__organization-code-input').val()).to.equal('ORGA00');
    });

  });

  describe('Actions', function() {

    beforeEach(function() {
      // given
      this.set('showingModal', true);
      this.set('view', 'sharing-confirmation');
      this.set('code', 'ABCD1234');
      this.set('organization', { foo: 'bar' });
      this.set('organizationNotFound', true);
      this.set('studentCode', 'student_code');
      this.set('campaignCode', 'campaign_code');

      this.render(hbs`{{share-profile
      _showingModal=showingModal
      _view=view
      _code=code
      _organization=organization
      _organizationNotFound=organizationNotFound
      _studentCode=studentCode
      _campaignCode=campaignCode}}`);
    });

    describe('#closeModal', function() {

      it('should remove all input information when modal is closed', async function() {
        // when
        await document.querySelector('.pix-modal__close-link > a').click();

        // then
        expect(this.get('showingModal')).to.be.false;
        expect(this.get('view')).to.equal('organization-code-entry');
        expect(this.get('code')).to.be.null;
        expect(this.get('organization')).to.be.null;
        expect(this.get('organizationNotFound')).to.be.false;
        expect(this.get('studentCode')).to.be.null;
        expect(this.get('campaignCode')).to.be.null;
      });

    });

    describe('#cancelSharingAndGoBackToOrganizationCodeEntryView', function() {

      it('should remove all input information but organization code when sharing confirmation is canceled', async function() {
        // when
        await document.querySelector('.share-profile__cancel-button').click();

        // then
        expect(this.get('showingModal')).to.be.true;
        expect(this.get('view')).to.equal('organization-code-entry');
        expect(this.get('code')).to.equal('ABCD1234');
        expect(this.get('organization')).to.be.null;
        expect(this.get('organizationNotFound')).to.be.false;
        expect(this.get('studentCode')).to.be.null;
        expect(this.get('campaignCode')).to.be.null;
      });
    });

  });

});
