import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'diesel/tests/helpers/start-app';
import {stubRequest} from 'diesel/tests/helpers/fake-server';

let application;
let orgId = 'o1'; // FIXME this is hardcoded to match the value for signIn in aptible-helpers
let roleId = 'r1';
let roleName = 'the-role';
let url = `/organizations/${orgId}/roles/new`;
let apiRoleUrl = `/roles/${roleId}`;
let apiRoleUsersUrl = `/roles/${roleId}/users`;
let apiUsersUrl = `/organizations/${orgId}/users`;

module('Acceptance: Organizations: Roles: New', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test(`visiting ${url} requires authentication`, () => {
  expectRequiresAuthentication(url);
});

test(`visiting ${url} shows form to create new role`, (assert) => {
  stubOrganization();

  signInAndVisit(url);
  andThen(() => {
    assert.equal(currentPath(), 'organization.roles.new');
    expectButton('Save');
    expectButton('Cancel');
    expectFocusedInput('role-name');
    expectInput('role-admin');
  });
});
