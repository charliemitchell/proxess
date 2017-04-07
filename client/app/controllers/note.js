import Ember from 'ember';

export default Ember.Controller.extend({
  actions : {
    remove () {
      if (confirm('Are you sure?')) {
        Ember.$.ajax({
          method: 'DELETE',
          url: '/notes/' + this.get('model._id'),
        }).then(note => {
          this.transitionToRoute('notes');
        });
      }
    }
  }
});
