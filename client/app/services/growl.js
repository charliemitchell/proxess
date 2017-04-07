import Ember from 'ember';

export default Ember.Service.extend({
  message (message) {
    let notification = Ember.$(`<notification onclick="$(this).remove();">${message}</notification>`);
    Ember.$('body').append(notification);
    setTimeout(() => notification.remove(), 2500);
  }
});
