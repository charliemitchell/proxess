import Ember from 'ember';

export default Ember.Route.extend({
  model (params) {
    return Ember.$.getJSON(`/notes/${params.id}`)
  }
});
