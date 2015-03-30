import Ember from "ember";

export default Ember.Controller.extend({
  isUnchanged: Ember.computed.not('isChanged'),
  isChanged: Ember.computed.or('_changesetIsChanged', 'model.isDirty'),
  _changesetIsChanged: false,

  observeChangeset: function() {
    this._super.apply(this, arguments);
    this.get('changeset').subscribeAll(() => {
      let hasChanged = false;
      this.get('changeset').forEachValue((keyData, initialValue, value) => {
        if (!hasChanged && initialValue.isEnabled !== value.isEnabled) {
          hasChanged = true;
        }
      });

      this.set('_changesetIsChanged', hasChanged);
    });
  }
});