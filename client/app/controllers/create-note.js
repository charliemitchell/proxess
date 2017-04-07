import Ember from 'ember';

export default Ember.Controller.extend({
  actions : {
    save () {
      Ember.$.post({
        url: '/notes',
        data : JSON.stringify(this.get('model')),
      }).then(note => {
        this.transitionToRoute('note', note._id);
      });
    }
  }
});
