import Ember from 'ember';

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
  }
});
