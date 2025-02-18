import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  serialize(snapshot) {
    let json = this._super(...arguments);

    json.data.attributes['first-name'] = snapshot.record.get('firstName');
    json.data.attributes['last-name'] = snapshot.record.get('lastName');
    json.data.attributes['email'] = snapshot.record.get('email');
    json.data.attributes['password'] = snapshot.record.get('password');

    return json;
  },

});
