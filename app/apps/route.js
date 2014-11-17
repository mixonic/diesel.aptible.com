import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(){
    var route = this;
    if (!this.session.get('isAuthenticated')) {
      return this.session.fetch().catch(function(){
        route.transitionTo('login');
      });
    }
  }
});
