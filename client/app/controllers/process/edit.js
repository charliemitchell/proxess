import Ember from 'ember';

export default Ember.Controller.extend({
    command: '',
    args: '',
    cwd: '',
    name: '',
    stopcmd: '',
    checkcmd: '',
    port: '',
    hidden: false,
    file: '',

    transformArgs: function () {
        return this.get('args').split(',').without(' ');
    },

    actions: {

        createfile: function(){
            this.set('model.file', '#Some bash script here')
        },

        copy: function () {
            this.transitionToRoute('process.new', this.get('model._id'));
        },

        save: function () {

            var args = this.get('args');

            var data = {
                command: this.get('command'),
                args: args.match(/\,/gi) ? this.transformArgs() : args,
                cwd: this.get('cwd'),
                name: this.get('name'),
                id: this.get('model.id'),
                _id: this.get('model._id'),
                stopcmd: this.get('stopcmd'),
                checkcmd: this.get('checkcmd'),
                port: this.get('port'),
                hidden: this.get('hidden'),
                file: this.get('file')
            };



            Ember.$.ajax({
                type: 'PUT',
                url: 'process/' + (data.id || data._id),
                data: JSON.stringify(data),
                success: function (res) {
                    this.notify.success("Process Updated");
                }.bind(this),
                error: function (res) {
                    this.notify.alert(res.responseJSON.err);
                }.bind(this)
            });
        },

        remove: function () {
            var confirmed = confirm("Are You Sure You Would Like To Remove This Process?");
            if (confirmed) {
                Ember.$.ajax({
                    type: 'DELETE',
                    url: 'process/' + this.get('model._id'),
                    success: function () {
                        this.notify.success("Process Removed")
                        this.transitionToRoute('process.list')
                    }.bind(this)
                });
            }
        },

        revert: function () {
            this.set('command', this.get('model.command'))
                .set('cwd', this.get('model.cwd'))
                .set('args', this.get('model.args').join(', '))
                .set('name', this.get('model.name'))
                .set('stopcmd', this.get('model.stopcmd'))
                .set('checkcmd', this.get('model.checkcmd'))
                .set('port', this.get('model.port'))
                .set('hidden', this.get('model.hidden'))
                .set('file', this.get('model.file'));
        }
    }
});
