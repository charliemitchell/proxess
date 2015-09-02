import Ember from 'ember';

export default Ember.Controller.extend({

    transformArgs: function() {
        return this.get('model.args').split(',').without(' ');
    },

    filechanged: function() {
        var args = this.get('model.file').match(/(\$\d \= \")\w+\"/g),
            key;

        if (args) {
            args = args.map(function(x) {
                key = x.replace(/\"/g, '').replace(/\$\d = /g, '');
                return '[?not' + key + ':' + key + ']'
            });

            this.set('model.args', 'build.sh,' + args.join(','));
        }

    }.observes('model.file'),

    actions: {
        createfile: function() {
            this.set('model.file', 'if [ $1 = "build" ]; then \n#Enter some commands here for building service \nfi\n\nif [ $2 = "run" ]; then \n#Enter some commands here for running service \nfi')
        },
        save: function() {
            var args = this.get('model.args');
            args = args.match(/\,/gi) ? this.transformArgs() : args
            this.set('model.args', args);
            // console.log(this.get('model'))
            Ember.$.ajax({
                type: 'POST',
                url: '/process',
                data: JSON.stringify(this.get('model')),
                success: function(response) {
                    this.notify.success('Process Saved!');
                    this.transitionToRoute('process.list');
                }.bind(this)
            });
        }
    }
});
