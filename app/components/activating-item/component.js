import Ember from 'ember';
import layout from './template';

export default Ember.Component.extend({
  routingService: Ember.inject.service('routing'),
  layout: layout,
  classNameBindings: ['active'],

  currentWhen: null,

  active: function(){
    return this.get('routingService.currentPath').indexOf(this.get('currentWhen')) === 0;
  }.property('routingService.currentPath', 'currentWhen')
});
