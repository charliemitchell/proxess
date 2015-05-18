import Ember from 'ember';

export default Ember.Route.extend({
    model : function (params) {
        return Ember.$.getJSON('/process/' + params.id).then(function (data) {
			return data;
        });
    }
});
