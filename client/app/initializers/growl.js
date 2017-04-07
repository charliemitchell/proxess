export function initialize(application) {
  application.inject('controller', 'growl', 'service:growl');
}

export default {
  name: 'growl',
  initialize
};
