import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('process', function() {
    this.route('new');
    this.route('new' , {path : 'new/:id'});
    this.route('edit' , {path : 'edit/:id'});
    this.route('manage');
    this.route('list');
    this.route('cpu');
    this.route('memory');
  });
  this.route('dashboard');
});

export default Router;
