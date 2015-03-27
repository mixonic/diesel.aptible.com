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
      let promise;

      changeset.forEachChangedValue((keyData, initialValue, value) => {
        let user = this.currentModel;
        let userLink = user.get('data.links.self');
        let role     = keyData.organizationRole;

        if (value) {
          promise = this.store.createRecord('membership', {
            user: userLink, role
          }).save();
        } else {
          promise = role.get('memberships').then((memberships) => {
            let userMembership = memberships.findBy('data.links.user', userLink);
            Ember.assert(`A user membership could not be found for user id "${user.get('id')}"
                          and role name ${role.get('name')}`,
                         !!userMembership);
            return userMembership.destroyRecord();
          });
        }

        promises.push(promise);
      });

      Ember.RSVP.all(promises).then(() => {
        this.transitionTo('organization.members');
      });
    }
  }
});
