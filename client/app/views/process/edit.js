import Ember from 'ember';

export default Ember.View.extend({
    didInsertElement : function () {

        (function () {
            // @this --> controller
            this
                .set('cwd', this.get('model.cwd'))
                .set('name', this.get('model.name'))
                .set('args', this.get('model.args').join(', '))
                .set('command', this.get('model.command'));
        }.call(this.get('controller')));

    }
});
