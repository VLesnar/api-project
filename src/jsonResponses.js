const crypto = require('crypto');

const notes = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(notes));
let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.end();
};

const addNote = (request, response, body) => {
  const responseJSON = {
    message: 'Text input is required',
  };

  if (!body.text) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  if (notes[body.text]) {
    responseCode = 204;
  } else {
    notes[body.text] = {};
  }

  notes[body.text].text = body.text;

  etag = crypto.createHash('sha1').update(JSON.stringify(notes));
  digest = etag.digest('hex');

  if (responseCode === 201) {
    responseJSON.message = 'Note created';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const getNotes = (request, response) => {
  const responseJSON = {
    notes,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 200, responseJSON);
};

const getNotesMeta = (request, response) => {
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSONMeta(request, response, 200);
};

const updateNote = (request, response) => {
  const newNote = {
    createdAt: Date.now(),
  };

  notes[newNote.createdAt] = newNote;

  etag = crypto.createHash('sha1').update(JSON.stringify(notes));
  digest = etag.digest('hex');

  return respondJSON(request, response, 201, newNote);
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getNotes,
  getNotesMeta,
  addNote,
  updateNote,
  notFound,
  notFoundMeta,
};
