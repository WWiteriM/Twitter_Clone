const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.write('Hi');
  res.end();
});
server.listen(3000);
