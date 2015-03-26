import Ember from 'ember';
import Changeset from "diesel/utils/changeset";

export default Ember.Route.extend({
  model(params){
    return this.store.find('user', params.user_id);
  },

  afterModel(model) {
    return model.get('roles');
  },

  setupController(controller, model){
    controller.set('model', model);
    controller.set('organization', this.modelFor('organization'));
    let changeset = Changeset.create({
      key(keyData) {
        return keyData.organizationRole.get('id');
      },
      initialValue(keyData) {
        const user = keyData.user;
        const organizationRole = keyData.organizationRole;
        return user.get('roles').contains(organizationRole);
      }
    });
    controller.set('changeset', changeset);
  },


  actions: {
    save() {
      const promises = [];
      const changeset = this.controller.get('changeset');

      changeset.forEachValue((keyData, initialValue, value) => {
        if (initialValue === value) {
          return;
        }

        if (value) {
          promises.push(this.store.createRecord('membership', {
            user: this.currentModel.get('data.links.self'),
            role: keyData.organizationRole
          }).save());
        } else {
          //crazy stuff
        }
      });

      Ember.RSVP.all(promises).then(() => {
        this.transitionTo('organization.members');
      });
    }
  }
});
