import Ember from 'ember';

export default Ember.View.extend({
    didInsertElement : function () {
        Ember.$("li.active").removeClass('active');
        Ember.$("#processes").addClass('active');
    }
});
