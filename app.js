// todo linux domain socket
// do both websockets and sse (event source)
// 64x64 operating system
//redis based.

var http = require("http")

var redis = require("redis")
var client = redis.createClient()
client.get("drew", function (err, val) {
  console.log(val)
})


var http = require('http');
var url = require('url')
var fs = require("fs")
var _ = require("underscore")

var listeners = {}
http.createServer(function (req, res) {
  var url_parts = url.parse(req.url, true);
  console.log(url_parts)
  var query = url_parts.query;
  var pathname = url_parts.pathname
  if (pathname == "/") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("./index.html", function (err, text) {
      res.end(text.toString()) 
    }) 
  } else if (pathname == "/touch") {
    res.end();
  } else if (pathname == "/events") {
    var id = _.uniqueId("listener")
    res.__my_id = id
    listeners[id] = res
    res.on('close', function () {
      delete listeners[id] 
    }) 
    res.writeHead(200, {'Content-Type': 'text/event-stream'});
    res.end()

  } else {
    res.end()
  }
  //res.end(JSON.stringify(query));
}).listen(1617);
console.log('server running');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

