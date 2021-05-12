let connected = false;

const socket = io('http://localhost:3000');
socket.emit('setup', userLoggedIn);

// eslint-disable-next-line no-unused-vars
socket.on('connected', () => {
  connected = true;
});
socket.on('message received', (newMessage) => {
  messageReceived(newMessage);
});
