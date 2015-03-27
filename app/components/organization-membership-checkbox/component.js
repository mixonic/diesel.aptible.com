import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  attributeBindings: ['type', 'checked', 'name', 'disabled'],
  type: 'checkbox',
  name: 'user-role',

  disabled: Ember.computed.reads('isDisabled'),
  checked: Ember.computed.reads('isChecked'),

  init(){
    this._super.apply(this, arguments);

    this._stagedObjectKey = {
      organizationRole: this.organizationRole,
      user: this.user
    };

    this.updateUI();
    this.changeset.subscribeAll(() => this.updateUI());
  },

  updateUI() {
    this.updateCheckbox();
    this.updateDisabled();
  },

  updateCheckbox() {
    const isChecked = this.changeset.value(this._stagedObjectKey);
    this.set('isChecked', isChecked);
  },

  updateDisabled() {
    let activeMemberships = [];
    this.changeset.forEachValue((keyData, initialValue, value) => {
      if (value === true) { activeMemberships.push(keyData); }
    });
    const isDisabled = activeMemberships.length === 1 &&
      activeMemberships[0] === this._stagedObjectKey;

    this.set('isDisabled', isDisabled);
  },

  click() {
    const isChecked = this.$().is(':checked');
    this.changeset.setValue(this._stagedObjectKey, isChecked);
  }

});
