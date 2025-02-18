import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

const ANSWER_BLOCK = '.correction-qroc-box__answer';
const ANSWER_INPUT = '.correction-qroc-box--answer__input';
const SOLUTION_BLOCK = '.correction-qroc-box__solution';

describe('Integration | Component | qroc solution panel', function() {

  setupComponentTest('qroc-solution-panel', {
    integration: true
  });

  it('should disabled all inputs', function() {
    // given
    this.render(hbs`{{qroc-solution-panel}}`);

    // then
    expect(document.querySelector('input')).to.have.attr('disabled');
  });

  describe('comparison when the answer is right', function() {

    const assessment = EmberObject.create({ id: 'assessment_id' });
    const challenge = EmberObject.create({ id: 'challenge_id' });
    const answer = EmberObject.create({ id: 'answer_id', result: 'ok', assessment, challenge });

    it('should diplay the answer in bold green and not the solution', function() {
      // given
      this.set('answer', answer);
      this.render(hbs`{{qroc-solution-panel answer=answer}}`);

      // when
      const answerInput = document.querySelector(ANSWER_INPUT);
      const answerBlock = document.querySelector(ANSWER_BLOCK);
      const solutionBlock = document.querySelector(SOLUTION_BLOCK);

      // then
      expect(answerInput).to.exist;
      expect(answerBlock).to.exist;
      expect(solutionBlock).to.not.exist;

      const answerInputStyles = window.getComputedStyle(answerInput);
      expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('none');
    });
  });

  describe('comparison when the answer is false', function() {

    beforeEach(function() {
      const assessment = EmberObject.create({ id: 'assessment_id' });
      const challenge = EmberObject.create({ id: 'challenge_id' });
      const answer = EmberObject.create({ id: 'answer_id', result: 'ko', assessment, challenge });

      this.set('answer', answer);
      this.render(hbs`{{qroc-solution-panel answer=answer}}`);
    });

    it('should display the false answer line-through', function() {
      // given
      const answerBlock = document.querySelector(ANSWER_BLOCK);
      const answerInput = document.querySelector(ANSWER_INPUT);

      // then
      expect(answerBlock).to.exist;
      const answerInputStyles = window.getComputedStyle(answerInput);
      expect(answerInputStyles.getPropertyValue('text-decoration')).to.include('line-through');
    });

    it('should display the solution with an arrow and the solution in bold green', function() {
      // given
      const blockSolution = document.querySelector(SOLUTION_BLOCK);

      // then
      expect(blockSolution).to.exist;
      const blockSolutionStyles = window.getComputedStyle(blockSolution);
      expect(blockSolutionStyles.getPropertyValue('align-items')).to.equal('stretch');
    });

    describe('comparison when the answer was not given', function() {

      beforeEach(function() {
        const assessment = EmberObject.create({ id: 'assessment_id' });
        const challenge = EmberObject.create({ id: 'challenge_id' });
        const answer = EmberObject.create({ id: 'answer_id', result: 'aband', assessment, challenge });

        this.set('answer', answer);
        this.set('isResultWithoutAnswer', true);
        this.render(hbs`{{qroc-solution-panel answer=answer}}`);
      });

      it('should display PAS DE REPONSE in italic', function() {
        // given
        const answerBlock = document.querySelector(ANSWER_BLOCK);

        // then
        expect(answerBlock).to.exist;
      });
    });
  });
});
