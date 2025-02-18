import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | result item campaign', function() {

  setupComponentTest('result-item-campaign-campaign', {
    integration: true
  });

  describe('Component rendering', function() {

    const providedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)';

    const emberChallengeObject = EmberObject.create({
      type: 'QCM',
      instruction: providedChallengeInstruction,
      proposals: '- soit possibilite A, et/ou' +
      '\n - soit possibilite B, et/ou' +
      '\n - soit possibilite C, et/ou' +
      '\n - soit possibilite D'
    });

    const answer = EmberObject.create({
      value: '2,4',
      result: 'ko',
      id: 1,
      challenge: emberChallengeObject,
      assessment: {
        id: 4
      }
    });

    beforeEach(function() {
      this.set('index', 0);
      return this.on('openComparisonWindow', () => {});
    });

    it('should exist', function() {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item-campaign answer=answer}}`);

      // then
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should render an instruction with no empty content', function() {
      // given
      this.set('answer', '');

      // when
      this.render(hbs`{{result-item-campaign answer=answer}}`);

      // then
      expect(this.$('.result-item-campaign__instruction')).to.have.lengthOf(1);
      expect(this.$('.result-item-campaign__instruction').text()).to.contain('\n');
    });

    it('should render the challenge instruction', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);

      // then
      const expectedChallengeInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs';
      expect(this.$('.result-item-campaign__instruction').text().trim()).to.equal(expectedChallengeInstruction);
    });

    it('should render an button when QCM', function() {
      // given
      this.set('answer', answer);

      this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);
      // Then
      expect(this.$('.result-item-campaign__correction-button').text().trim()).to.deep.equal('Réponses et tutos');
    });

    it('should render tooltip for the answer', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);

      // then
      expect(this.$('div[data-toggle="tooltip"]').attr('data-original-title').trim()).to.equal('Réponse incorrecte');
    });

    it('should not render a tooltip when the answer is being retrieved', function() {
      // given
      this.set('answer', null);

      // when
      this.render(hbs`{{result-item-campaign answer=answer}}`);

      // then
      expect(this.$('div[data-toggle="tooltip"]').attr('data-original-title')).to.equal(undefined);
    });

    it('should update the tooltip when the answer is eventually retrieved', function() {
      // given
      this.set('answer', null);
      this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);

      // when
      this.set('answer', answer);

      // then
      expect(this.$('div[data-toggle="tooltip"]').attr('data-original-title').trim()).to.equal('Réponse incorrecte');
    });

    it('should render tooltip with an image', function() {
      // given
      this.set('answer', answer);

      // when
      this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);

      // Then
      expect(this.$('result-item-campaign__icon-img'));
    });

    [
      { status: 'ok', color:'green' },
      { status: 'ko', color:'red' },
      { status: 'aband', color:'grey' },
      { status: 'partially', color:'orange' },
      { status: 'timedout', color:'red' },
    ].forEach(function(data) {

      it(`should display the good result icon when answer's result is "${data.status}"`, function() {
        // given
        answer.set('result', data.status);
        this.set('answer', answer);

        // when
        this.render(hbs`{{result-item-campaign answer=answer openAnswerDetails=(action 'openComparisonWindow')}}`);

        // then
        expect(this.$(`.result-item-campaign__icon--${data.color}`)).to.have.lengthOf(1);
      });
    });
  });
});
