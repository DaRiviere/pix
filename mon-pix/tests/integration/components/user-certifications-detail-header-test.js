import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail header', function() {
  setupComponentTest('user-certifications-detail-header', {
    integration: true,
  });

  let certification;

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-header certification=certification}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when certification is complete', function() {

    beforeEach(function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      this.render(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    // then
    it('should show the certification icon', function() {
      expect(this.$('.user-certifications-detail-header__icon')).to.have.lengthOf(1);
    });

    it('should show the certification date', function() {
      expect(this.$('.user-certifications-detail-header__data-box')).to.have.lengthOf(1);
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.include('15 février 2018');
    });

    it('should show the certification user full name', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.include('Nom : Jean Bon');
    });

    it('should show the certification user birthdate', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.include('Date de naissance : 22' +
        ' janvier 2000');
    });

    it('should show the certification user birthplace', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.include('Lieu de naissance : Paris');
    });

    it('should show the certification center', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.include('Centre de' +
        ' certification : Université de Lyon');
    });
  });

  context('when certification is not complete', function() {

    beforeEach(function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: null,
        birthplace: null,
        firstName: null,
        lastName: null,
        date: null,
        certificationCenter: null,
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      this.render(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    // then
    it('should not show the certification date', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.not.include('obtenue le');
    });

    it('should not show the certification user full name', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.not.include('Nom :');
    });

    it('should not show the certification user birthdate', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.not.include('Date de naissance :');
    });

    it('should not show the certification user birthplace', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.not.include('Lieu de naissance :');
    });

    it('should not show the certification center', function() {
      expect(this.$('.user-certifications-detail-header__data-box').text()).to.not.include('Centre de' +
        ' certification :');
    });
  });
});
