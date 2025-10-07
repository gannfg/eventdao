const http = require('http');

const server = http.createServer((req, res) => {
  try {
    const location = `http://localhost:3001${req.url || '/'}`;
    const body = `Redirecting to ${location}`;
    res.writeHead(307, {
      Location: location,
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
  } catch (err) {
    res.statusCode = 500;
    res.end('Redirector error');
  }
});

server.listen(3000, () => {
  console.log('Redirector listening on http://localhost:3000 -> http://localhost:3001');
});


