import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from 'ember';

let featuresMock;

function buildFeaturesMock() {
  return Ember.Object.extend({
    isEnabled: function() {}
  });
}

moduleForComponent('service-scaler', 'ServiceScalerComponent', {
  integration: true,
  setup: function() {
    this.container.register('service:features-mock', buildFeaturesMock());
    this.container.injection('component', 'features', 'service:features-mock');
    featuresMock = this.container.lookup('service:features-mock');
  }
});

test('it renders', function() {
  expect(2);

  // creates the component instance
  var component = this.subject({
    service: Ember.Object.create({
      containerCount: 1
    })
  });
  equal(component._state, 'preRender');

  // appends the component to the page
  this.render();
  equal(component._state, 'inDOM');
});
