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
let url = `/organizations/${orgId}/roles/${roleId}`;
let apiRoleUrl = `/roles/${roleId}`;

module('Acceptance: Organizations: Roles Show', {
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

test(`visiting ${url} shows role edit fields`, (assert)=> {
  stubOrganization();
  stubStacks({}, []);
  // This stubs out the roles URL, and since the roleId
  // matches that in the visited URL the data from this
  // index response is used.
  signIn(null, {
    id: roleId,
    name: roleName,
  });
  visit(url);
  andThen(() => {
    const nameInput = findInput('role-name');
    assert.equal(nameInput.val(), roleName, 'Role name is in the input');

    const adminInput = findInput('role-admin');
    assert.ok(adminInput.is(':checked'), 'role is privileged');
  });
});

test(`visiting ${url} lists permissions by stack`, (assert)=> {
  let orgUrl = `/organizations/${orgId}`;
  stubOrganization({
    id: orgId,
    _links: {
      self: { href: orgUrl }
    }
  });

  let stackHandle = 'stack1-handle';
  let scopes = ['Read', 'Manage'];

  let permissions = [{
    id: 'p1',
    scope: 'read',
    _links: {
      role: { href: '/some/other/role' }
    }
  }];

  let stackId = 'stack1';
  let stacks = [{
    id: stackId,
    handle: stackHandle,
    _links: {
      organization: { href: orgUrl }
    }
  }];
  stubStacks({}, stacks);

  let postedPermission;
  let createPermissionUrl = `/accounts/${stackId}/permissions`;
  stubRequest('post', createPermissionUrl, function(request){
    postedPermission = true;
    const body = this.json(request);

    // the first checkbox is 'read' scope, hardcoded by the template
    assert.equal(body.scope, 'read',
                 `posts with scope read`);
    assert.equal(body.role, apiRoleUrl,
                 `posts with role url`);
    return this.success({});
  });

  signIn(null, {
    id: roleId,
    privileged: false,
    name: roleName,
    _links: { self: { href: apiRoleUrl } }
  });
  visit(url);

  andThen(() => {
    assert.ok(find(`:contains(${stackHandle})`).length,
              'has stack handle');

    scopes.forEach((s) => {
      assert.ok(find(`:contains(${s})`).length,
                `has "${s}" scope`);
    });

    assert.equal(find(`input.permission-checkbox:not(:checked)`).length, scopes.length*stacks.length,
                 'has an unchecked checkbox for each scope');
  });
  click(`input.permission-checkbox:eq(0)`);
  andThen(() => {
    assert.ok(!postedPermission, 'did not hit server yet');

    clickButton('Update Role');
  });
  andThen(() => {
    assert.ok(postedPermission, 'posts to server');
  });
});

test(`visiting ${url} lists permissions by stack, checked boxes when permissions are present`, (assert)=> {
  let orgUrl = `/organizations/${orgId}`;
  stubOrganization({
    id: orgId,
    _links: {
      self: { href: orgUrl }
    }
  });

  let stackHandle = 'stack1-handle';
  let scopes = ['Read', 'Manage'];
  let permissions = [{
    id: 'p1',
    scope: 'read',
    _links: {
      role: { href: apiRoleUrl },
    }
  }, {
    id: 'p2',
    scope: 'manage',
    _links: {
      role: { href: apiRoleUrl },
    }
  }];

  let stackId = 'stack1';
  let stacks = [{
    id: stackId,
    handle: stackHandle,
    _links: {
      organization: { href: orgUrl },
    },
    _embedded: {
      permissions
    }
  }];
  stubStacks({}, stacks);

  let deletedPermission;
  let expectedPermissionId = permissions[0].id;
  let deletePermissionUrl  = `/permissions/${expectedPermissionId}`;
  stubRequest('delete', deletePermissionUrl, function(request){
    deletedPermission = true;
    return this.noContent();
  });

  signIn(null, {
    id: roleId,
    privileged: false,
    name: roleName
  });
  visit(url);

  andThen(() => {
    assert.ok(find(`:contains(${stackHandle})`).length,
              'has stack handle');

    scopes.forEach((s) => {
      assert.ok(find(`:contains(${s})`).length,
                `has "${s}" scope`);
    });

    assert.equal(find(`input.permission-checkbox:checked`).length, scopes.length*stacks.length,
                 'has a checked checkbox for each scope');
  });
  click(`input.permission-checkbox:eq(0)`);
  andThen(() => {
    assert.ok(!deletedPermission, 'did not hit server yet');

    clickButton('Update Role');
  });
  andThen(() => {
    assert.ok(deletedPermission, 'deletes to server');
  });
});

test(`visiting ${url} saves changed name and privileged values`, (assert)=> {
  assert.expect(2);
  stubOrganization();
  stubStacks({}, []);
  // This stubs out the roles URL, and since the roleId
  // matches that in the visited URL the data from this
  // index response is used.
  signIn(null, {
    id: roleId,
    name: roleName,
  });

  const changedName = 'Kim Kelly';

  stubRequest('put', `/roles/${roleId}`, function(request) {
    const body = this.json(request);
    assert.equal(body.name, changedName, 'name is saved');
    assert.equal(body.privileged, false, 'privileged state is saved');
    return this.noContent();
  });

  visit(url);
  fillInput('role-name', changedName);
  // Should uncheck the admin role
  click('input[name=role-admin]');
  clickButton('Update Role');

});
