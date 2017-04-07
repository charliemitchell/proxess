import Ember from 'ember';
export function initialize(/* application */) {
  Ember.$.ajaxSetup({
    contentType: "application/json"
  });
}

export default {
  name: 'ajax',
  initialize
};
