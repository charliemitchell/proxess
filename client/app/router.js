import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('dashboard');
  this.route('notes');
  this.route('note', {path : 'notes/:id'});
  this.route('createNote', {path: 'create-note'});

  this.route('process', function() {
    this.route('new');
    this.route('edit' , {path : 'edit/:id'});
    this.route('manage');
    this.route('list');
    this.route('memory');
    this.route('cpu');
  });
  this.route('edit-note', {path : 'note/:id'});
});

export default Router;
