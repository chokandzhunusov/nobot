/*jshint esversion: 6 */

var fs = require('fs');
var url = require('url');
var http = require('http');
var axios = require('axios');

var socket;
var settings = require('./settings.json');


const server = http.createServer((request, response) => {
  let request_body = '';
  if (request.method == 'POST') {
    request.on('data', function(d) {
        request_body += d;
    });
  }

  let path_name = url.parse(request.url).pathname;
  if (path_name == '/') {
    path_name = '/index.html';
  }

  fs.readFile(__dirname + path_name, function(error, data) {
    if (error) {
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.end(JSON.stringify(settings.server_response));

      let result = {
        'method': request.method,
        'headers': request.headers,
        'path_name': path_name,
        'query_params': url.parse(request.url, true).query,
        'request_body': request_body
      };

      // send all info that came from bot
      socket.emit('stream', result);

    } else {
      response.writeHead(200);
      response.write(data, "utf8");
      response.end();
    }
  });
});

server.listen(settings.server_port, settings.server_host, () => {
  console.log(`Server started. Point your bot endpoint to http://${settings.server_host}:${settings.server_port}`);
});

var io = require('socket.io')(server);
io.sockets.on('connection', function(sock) {
    console.log('connected');
    socket = sock;

    // handle events and send them to bot's endpoint
    sock.on('bot', function (from, msg) {
      let params = {};

      switch (from) {
        case 'message/new':
          params = {
            'event': from,
            'data':{
              'id': settings.message_id,
              "content": msg,
              "status": 0,
              "type":"text/plain",
              "sender_id": settings.user_id,
              "chat_id": settings.chat_id
            }
          };
          break;
        case 'user/follow':
        case 'user/unfollow':
          params = {
            'event': from,
            'data': {
              'id': settings.user_id,
              'name': 'nobot',
              'gender': 'M',
              'birthdate': ''
            },
          };
          break;
      }

      axios.post(settings.bot_host, JSON.stringify(params))
      .catch(function (error) {
        console.log(error);
      });
    });

});

