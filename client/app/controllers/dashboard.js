import Ember from 'ember';
export default Ember.Controller.extend(Ember.Evented, {
    logs: Ember.A(),
    log: {
        title: "",
        content: []
    },   
    service: false,
    id: '',
    search: '',
    running: function() {
        var runningprocesses = this.get('mirror.processes').filter(function(x) {
            return x.running === true;
        });
        return runningprocesses.length;
    }.property('mirror.processes.@each.running'),
    filter: function() {
        if (this.get('search')) {
            var arr = this.get('model').processes;
            arr = arr.filter(function(item) {
                return item.name.match(new RegExp(this.get('search'), 'ig'));
            }.bind(this));
            this.set('mirror', {
                processes: arr
            });
        } else {
            this.set('mirror', this.get('model'));
        }
        this.trigger('setupint');
    }.observes('search'),
    mirror: function() {
        return this.get('model');
    }.property('mirror'),
    actions: {
        runningonly: function() {
            var arr = this.get('mirror.processes').filter(function(x) {
                return x.running === true;
            });
            // arr.forEach(function(item) {
            //     Ember.set(item, 'running', false);
            // });
            this.set('mirror', {
                processes: arr
            });
            this.trigger('setupint');
        },
        all: function() {
            var arr = this.get('model').processes;
            // arr.forEach(function(item) {
            //     Ember.set(item, 'running', false);
            // });
            this.set('mirror', {
                processes: arr
            });
            this.trigger('setupint');
        },
        search: function(e, a) {
            this.filter();
            // Ember.$.ajax({
            //     type: 'GET',
            //     url: '/dashboard/?search=' + this.get('search'),
            //     success: function (data) {
            //         this.set('mirror', data);
            //         this.trigger('setupint');
            //     }.bind(this)
            // });
        },
        logs: function(process) {
            this.set('log.title', process.name);
            this.set('log.content', this.get('logs').filterBy('id', process.id));
            Ember.$('#logs').modal('show');
        },
        kill: function(process) {
            Ember.set(process, 'starting', false); //this is for the animation
            Ember.set(process, 'stopping', true); //this is for the animation
            Ember.$.ajax({
                type: 'DELETE',
                url: '/execute/' + process.id
            });
        },
        start: function(process) {
            var pid = process ? process.id : this.get('id');
            var newservice = this.get('service');
            if (!process) {
                var options = $('#custombuild .modal-body input:checked');
                for (var i = 0; i < options.length; i++) {
                    newservice.args[i] = $(options[i]).val();
                }
            }
            if (process) {
                Ember.set(process, 'stopping', false); //this is for the animation
                Ember.set(process, 'starting', true); //this is for the animation
            }
            Ember.$.ajax({
                type: 'POST',
                url: '/execute/' + pid,
                data: JSON.stringify({
                    service: process ? false : newservice
                }),
                success: function(data) {
                    if (data.service && data.needbuild) {
                        for (var i = 0; i < data.service.args.length; i++) {
                            if (data.service.args[i].match(/\?/g)) {
                                data.service.args[i] = data.service.args[i].replace(/[\?\[\]]/g, '').split(':');
                            } else {
                                data.service.args[i] = [data.service.args[i]];
                            }
                        }
                        this.set('id', data.service.id);
                        this.set('service', data.service);
                        Ember.$('#custombuild').modal('show');
                    }
                }.bind(this)
            });
        }
    }
});
