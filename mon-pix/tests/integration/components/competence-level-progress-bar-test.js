import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence level progress bar', function() {

  setupComponentTest('competence-level-progress-bar', {
    integration: true,
  });

  it('renders', function() {
    this.render(hbs`{{competence-level-progress-bar}}`);
    expect(this.$()).to.have.length(1);
  });

  describe('progress bar', function() {

    context('if the competence is not assessed', function() {

      it('should not display the background of progress bar which display limit and max level', function() {
        //Given
        const competence = { level: -1, isAssessed: false };
        this.set('competence', competence);

        //When
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__background')).to.have.lengthOf(0);
      });

      it('should not display a progress bar if level is not defined (-1)', function() {
        //Given
        const competence = { level: undefined, isAssessed: false };
        this.set('competence', competence);

        //When
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(0);
      });

    });

    context('if the competence is assessed', function() {

      it('should indicate the limit level and the max level reachable in the progress bar', function() {
        // given
        const MAX_LEVEL = 8;
        const LIMIT_LEVEL = 5;
        const competence = { level: 4, isAssessed: true };
        this.set('competence', competence);

        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__background-level-limit-indicator')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__background-level-limit-indicator').text().trim()).to.equal(LIMIT_LEVEL.toString());
        expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__background-level-limit-max-indicator').text().trim()).to.equal(MAX_LEVEL.toString());
      });

      it('should display a progress bar if level is defined (equal or more than 0)', function() {
        //Given
        const competence = { level: 1, isAssessed: true };
        this.set('competence', competence);

        //When
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        //Then
        expect(this.$('.competence-level-progress-bar__level')).to.have.lengthOf(1);
      });

      it('should indicate the level passed to the component at the end of the progress bar', function() {
        // given
        const competence = { level: 5, isAssessed: true };
        this.set('competence', competence);

        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__level-indicator').text().trim()).to.be.equal('5');
      });
    });

  });

  describe('start course link', function() {

    it('should display ’commencer’ in progress bar when the competence is assessable for the first time', function() {
      // given
      const competence = {
        name: 'Premier test de positionnement',
        courseId: 'rec123',
        isAssessableForTheFirstTime: true,
      };
      this.set('competence', competence);

      // when
      this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-start').text().trim()).to.contains('Commencer le test "Premier test de positionnement"');
    });

    it('should not display ’commencer’ in progress bar when the competence is not assessable for the first time', function() {
      // given
      const competence = {
        name: 'Premier test de positionnement',
        courseId: 'rec123',
        isAssessableForTheFirstTime: false
      };
      this.set('competence', competence);

      // when
      this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

      // then
      expect(this.$('a.competence-level-progress-bar__link-start')).to.have.lengthOf(0);
    });

  });

  describe('resume assessment link', function() {

    it('should display `Reprendre` if competence is being evaluated and there is an assessment related', function() {
      // given
      const competence = { name: 'deuxième test', assessmentId: 'awesomeId', isBeingAssessed: true };
      this.set('competence', competence);

      // when
      this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

      // then
      expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-resume')).to.have.lengthOf(1);
      expect(this.$('a.competence-level-progress-bar__link-resume').text().trim()).to.be.equal('Reprendre le test "deuxième test"');
    });

  });

  describe('retry link', async function() {

    context('when competence is assessed and retryable', async function() {

      const competence = {
        name: 'deuxième test',
        assessmentId: 'awesomeId',
        courseId: 'rec123aZe',
        isAssessed: true,
        isRetryable: true,
        level: 3
      };

      beforeEach(async function() {
        this.set('competence', competence);
      });

      it('should display `Retenter` button', function() {
        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
        expect(this.$('button.competence-level-progress-bar__retry-link')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__retry-link').text().trim()).to.be.equal('Retenter le test "deuxième test"');
      });

      it('should display a modal when clicked', async function() {
        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);
        await this.$('.competence-level-progress-bar__retry-link').click();
        const $modal = document.querySelector('.pix-modal__container');

        // then
        expect($modal).to.be.ok;
        expect($modal.querySelector('.pix-modal-header__title').textContent).to.contains('Retenter');
        expect($modal.querySelector('.competence-level-progress-bar__modal-body').textContent).to.contains('Votre niveau actuel sera remplacé par celui de ce nouveau test');
        expect($modal.querySelector('.competence-level-progress-bar__modal-link-cancel').textContent).to.contains('Annuler');
        expect($modal.querySelector('.competence-level-progress-bar__modal-link-validate').textContent).to.contains('J’ai compris');
      });

      it('should not display remaining days info', function() {
        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__retry-delay')).to.have.lengthOf(0);
      });

    });

    context('when competence is assessed and not retryable', async function() {

      const competence = {
        name: 'deuxième test',
        assessmentId: 'awesomeId',
        courseId: 'rec123aZe',
        isAssessed: true,
        isRetryable: false,
        level: 3
      };

      beforeEach(async function() {
        this.set('competence', competence);
      });

      it('should display `Retenter` text but not clickable', function() {
        // given
        competence.daysBeforeNewAttempt = 5;

        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('button.competence-level-progress-bar__retry-link')).to.have.lengthOf(0);
        expect(this.$('.competence-level-progress-bar__link')).to.have.lengthOf(1);
        expect(this.$('.competence-level-progress-bar__link').text().trim()).to.be.equal('Retenter le test "deuxième test"');
      });

      it('should display `1 day` if there is one day left to wait', function() {
        // given
        competence.daysBeforeNewAttempt = 1;

        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__retry-delay').text().trim()).to.equal('dans 1 jour');
      });

      it('should display `4 days` if there are 4 days left to wait', function() {
        // given
        competence.daysBeforeNewAttempt = 4;

        // when
        this.render(hbs`{{competence-level-progress-bar competence=competence}}`);

        // then
        expect(this.$('.competence-level-progress-bar__retry-delay').text().trim()).to.equal('dans 4 jours');
      });

    });

  });

});
