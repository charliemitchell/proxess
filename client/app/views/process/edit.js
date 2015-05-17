import Ember from 'ember';

export default Ember.View.extend({
    didInsertElement : function () {

        (function () {
            // @this --> controller
            this
                .set('cwd', this.get('model.cwd'))
                .set('name', this.get('model.name'))
                .set('args', this.get('model.args').join(', '))
                .set('command', this.get('model.command'))
                .set('stopcmd', this.get('model.stopcmd'))
                .set('checkcmd', this.get('model.checkcmd'))
                .set('port', this.get('model.port'))
                .set('hidden', this.get('model.hidden'));
        }.call(this.get('controller')));

    }
});
