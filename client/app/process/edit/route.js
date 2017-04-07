import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    return Ember.$.getJSON('/process/' + params.id)
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.send('revert');
  }

});
