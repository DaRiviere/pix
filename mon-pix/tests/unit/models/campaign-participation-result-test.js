import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Campaign-Participation-Result', function() {

  setupModelTest('campaign-participation-result', {
    needs: ['model:competence-result']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('maxTotalSkillsCountInCompetences', function() {

    it('should calculate max total skills', function() {
      const store = this.store();
      const competenceResult1 = store.createRecord('competence-result', {
        totalSkillsCount: 2
      });
      const competenceResult2 = store.createRecord('competence-result', {
        totalSkillsCount: 11
      });
      const competenceResult3 = store.createRecord('competence-result', {
        totalSkillsCount: 10
      });

      const model = this.subject();
      model.set('competenceResults', [competenceResult1, competenceResult2, competenceResult3]);

      // when
      const maxTotalSkillsCountInCompetences = model.get('maxTotalSkillsCountInCompetences');

      // then
      expect(maxTotalSkillsCountInCompetences).to.equal(11);
    });
  });

  describe('masteryPercentage', function() {

    it('should calculate total validated skills percentage', function() {
      const model = this.subject();
      model.set('totalSkillsCount', 45);
      model.set('validatedSkillsCount', 40);

      // when
      const masteryPercentage = model.get('masteryPercentage');

      // then
      expect(masteryPercentage).to.equal(89);
    });
  });
});
