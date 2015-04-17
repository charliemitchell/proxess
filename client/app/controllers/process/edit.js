import Ember from 'ember';

export default Ember.Controller.extend({
    command: '',
    args: '',
    cwd: '',
    name: '',

    transformArgs: function() {
        return this.get('args').split(',').without('');
    },

    actions: {

        save: function() {
            var data = {
                command : this.get('command'),
                args : this.transformArgs(),
                cwd  : this.get('cwd'),
                name : this.get('name'),
                id : this.get('model.id'),
                _id : this.get('model._id'),
                stopcmd: this.get('model.stopcmd'),
                checkcmd: this.get('model.checkcmd'),
                port: this.get('model.port')
            };

            Ember.$.ajax({
                type: 'PUT',
                url: 'process/' + data.id,
                data: JSON.stringify(data),
                success: function() {
                    this.notify.success("Process Updated");
                }.bind(this)
            });
        },

        remove: function() {
            var confirmed = confirm("Are You Sure You Would Like To Remove This Process?");
            if (confirmed) {
                Ember.$.ajax({
                    type: 'DELETE',
                    url: 'process/' + this.get('model.id'),
                    success: function() {
                        this.notify.success("Process Removed")
                        this.transitionToRoute('process.list')
                    }.bind(this)
                });
            }
        },

        revert: function() {
            this.set('command', this.get('model.command'))
                .set('cwd', this.get('model.cwd'))
                .set('args', this.get('model.args').join(', '))
                .set('name', this.get('model.name'));
        }
    }
});
