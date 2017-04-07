import Ember from 'ember';

export default Ember.Controller.extend({
  actions : {
    save () {
      Ember.$.ajax({
        method: 'PUT',
        url: '/notes/' + this.get('model._id'),
        data : JSON.stringify(this.get('model')),
      }).then(note => {
        this.transitionToRoute('note', note._id);
      });
    }
  }
});
