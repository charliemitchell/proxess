export function initialize(application) {
  application.inject('controller', 'websocket', 'service:websocket');
  application.inject('component', 'websocket', 'service:websocket');
}

export default {
  name: 'websocket',
  initialize
};
