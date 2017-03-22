const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addNote') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);
      jsonHandler.addNote(request, res, bodyParams);
    });
  }
};

const handleGet = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/':
      htmlHandler.getIndex(request, response);
      break;
    case '/style.css':
      htmlHandler.getStyle(request, response);
      break;
    case '/background.png':
      htmlHandler.getBackground(request, response);
      break;
    case '/getNotes':
      jsonHandler.getNotes(request, response);
      break;
    case '/updateNote':
      jsonHandler.updateNote(request, response);
      break;
    default:
      jsonHandler.notFound(request, response);
      break;
  }
};

const handleHead = (request, response, parsedUrl) => {
  switch (parsedUrl.pathname) {
    case '/getNotes':
      jsonHandler.getNotesMeta(request, response);
      break;
    default:
      jsonHandler.notFoundMeta(request, response);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'GET') {
    handleGet(request, response, parsedUrl);
  } else if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleHead(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on port: ${port}`);
