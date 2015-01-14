import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    var route = this;

    route.replaceWith('stacks');
  }
});
