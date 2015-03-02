import Ember from 'ember';

export function initialize(/* container, application */) {
    // Force JSON Headers on Everything
    Ember.$.ajaxSetup({
        contentType: 'application/json'
    });
}

export default {
  name: 'ajax-setup',
  initialize: initialize
};
