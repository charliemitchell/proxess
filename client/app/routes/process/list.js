import Ember from 'ember';

export default Ember.Route.extend({
    model : function () {
        return Ember.$.getJSON('/process').then(function (list) {
            return list;
        });
    }
});
