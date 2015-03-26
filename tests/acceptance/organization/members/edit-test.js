import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'diesel/tests/helpers/start-app';
import {stubRequest} from 'diesel/tests/helpers/fake-server';

var application;
let orgId = 'big-co';
let roles = [{
  id: 'r1',
  name: 'owners'
}, {
  id: 'r2',
  name: 'external'
}];
let userRoles = [roles[0]];
let userId = 'user-25';

let apiMemberUrl = `/users/${userId}`;
let apiRolesUrl = `/organizations/${orgId}/roles`;
let apiUserRolesUrl = `/users/${userId}/roles`;
let url = `/organizations/${orgId}/members/${userId}/edit`;

let user = {
  id: userId,
  name: 'Bob LastName',
  email: 'bob@lastname.com',
  _links: { roles: { href: apiUserRolesUrl } }
};

module('Acceptance: Organization Members: Member', {
  beforeEach: function() {
    application = startApp();
    stubOrganization({
      id: orgId,
      _links: {
        roles: { href: apiRolesUrl }
      }
    });

    stubRequest('get', apiMemberUrl, function(request){
      return this.success(user);
    });

    stubRequest('get', apiRolesUrl, function(request){
      return this.success({ _embedded: { roles } });
    });

    stubRequest('get', apiUserRolesUrl, function(request){
      return this.success({ _embedded: { roles: userRoles } });
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test(`visiting ${url} requires authentication`, function(){
  expectRequiresAuthentication(url);
});

test(`visiting ${url} shows user's info and all roles with checkboxes`, function(assert) {
  assert.expect(3 + 3*roles.length);

  signInAndVisit(url);

  andThen(function() {
    assert.equal(currentPath(), 'organization.members.edit');
    assert.ok(find(`:contains(${user.name})`).length, `user name "${user.name} is on the page`);
    assert.ok(find(`:contains(${user.name})`).length, `user email "${user.email} is on the page`);

    roles.forEach((role, index) => {
      let roleDiv = find(`.role:eq(${index})`);

      assert.ok(roleDiv.text().indexOf(role.name) > -1,
                `has role "${role.name}"`);

      let input = findInput('user-role', {context:roleDiv});
      assert.ok(input.length, `finds a checkbox for role "${role.name}"`);

      let isChecked = userRoles.indexOf(role) > -1;
      if (isChecked) {
        assert.ok(input.is(':checked'),
                  `input for role "${role.name}" is checked`);
      } else {
        assert.ok(!input.is(':checked'),
                  `input for role "${role.name}" is not checked`);
      }
    });
  });
});
