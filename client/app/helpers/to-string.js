import Ember from 'ember';

export function toString(input) {
  return input.join(', ');
}

export default Ember.Handlebars.makeBoundHelper(toString);
