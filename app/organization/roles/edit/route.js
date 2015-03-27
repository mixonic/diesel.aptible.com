import Changeset from 'diesel/utils/changeset';
import Ember from 'ember';

export default Ember.Route.extend({
  init() {
    this._super();
    this._stacks = null;
    this._organization = null;
  },
  model(params) {
    return this.store.find('role', params.role_id);
  },
  afterModel() {
    this._organization = this.modelFor('organization');
    const organizationUrl = this._organization.get('data.links.self');

    // Find only the stacks that belong to the
    // current organization
    return this.store.find('stack').then(() => {
      return this.store.filter('stack', (stack) => {
        return stack.get('data.links.organization') === organizationUrl;
      });
    }).then((stacks) => {
      this._stacks = stacks;
    });
  },
  setupController(controller, model) {
    controller.set('model', model);
    controller.set('stacks', this._stacks);
    controller.set('organization', this._organization);

    const changeset = Changeset.create({
      key(keyData) {
        return `${keyData.stack.get('handle')}-${keyData.scope}`;
      },
      initialValue(keyData) {
        const permissions = keyData.stack.get('permissions.content');
        const role = keyData.role;
        const scope = keyData.scope;

        const value = {};

        value.permission = permissions.find((perm) => {
          let roleLink = role.get('data.links.self');
          let permRoleLink = perm.get('data.links.role');
          return roleLink === permRoleLink &&
            perm.get('scope') === scope;
        });
        value.isEnabled = !!value.permission;

        return value;
      }
    });
    controller.set('changeset', changeset);
  },
  actions: {
    save() {

      const savePromises = [];
      const changeset = this.controller.get('changeset');

      changeset.forEachChangedValue((keyData, initialValue, value) => {
        let promise;
        if (value.isEnabled) {
          promise = this.store.createRecord('permission', {
            role:  keyData.role,
            scope: keyData.scope,
            stack: keyData.stack,
            roleUrl: keyData.role.get('data.links.self')
          }).save();
        } else {
          promise = value.permission.destroyRecord();
        }

        savePromises.push(promise);
      });

      return Ember.RSVP.all(savePromises).then(() => {
        this.transitionTo('organization.roles');
      });
    }
  }
});

