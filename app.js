// todo linux domain socket
// do both websockets and sse (event source)
// 64x64 operating system
//redis based.

var thew = 32
var themillis = 32
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
var _s = require("underscore.string")

var listeners = {}
var listenersWs = {}

setInterval(function () {
  var json = getMessageJson()
  //_.each(listeners, function (res) {
  //  res.write("data: " + json + "\n\n")
  //})

  _.each(listenersWs, function (ws) {
    ws.send(json)
  })
}, themillis)

var allColors = ["red", "green", "blue", "pink", "lime", "cyan", "magenta", "yellow", "orange"]
//var allColors = ["black", "white"]
var allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
//var allColors = [0, 1]
//var allColors = ["#ff0000", "#00ffff", "#00ff00", "orange"]

var rgb = [0,0,0]
var increment = function (number, by, max, index) {
  if (!index && index !== 0) {index = number.length - 1} 

  rgb[index] += by
  if (rgb[index] >= max) {
    rgb[index] = 0
    if (index == 0) {
      return [0,0,0] // todo make it the length
    } else {
      increment(rgb, by, max, index - 1)
    }
  }
}

var formatRgb = function (rgb) {
  return "#" 
     + _s.lpad(rgb[0].toString(16), 2, "0")
     + _s.lpad(rgb[1].toString(16), 2, "0")
     + _s.lpad(rgb[2].toString(16), 2, "0")
}

var getMessageJson = function () {
  var colors = []
  var letters = []
  var w = thew
  var h = w
  _.times(w * h, function () {
    increment(rgb, 56, 256);
     var color = formatRgb(rgb)
    //colors.push(allColors[_.random(0, allColors.length - 1)]) 
    //colors.push("#" + _s.lpad(_.random(0,0xffffff).toString(16), 6, 0))
    colors.push(color)
    //if (color == "#001100") { process.exit()}
    //console.log(color)
    //letters.push(allLetters[_.random(0, allLetters.length - 1)]) 
  })
  //letters = "hello world".split("")
  var ret = {
    x: 0,
    y: 0,
    w: w,
    h: h,
    colors: colors,
    letters: letters,
  }
  return JSON.stringify(ret)
}

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 1618});

wss.on('connection', function(ws) {
  var id = _.uniqueId("listener")
  ws.__my_id = id
  listenersWs[id] = ws
  ws.on('close', function () {
    delete listenersWs[id] 
  }) 
  ws.on('message', function(message) {
  });
  //ws.send('something');
});

http.createServer(function (req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var pathname = url_parts.pathname
  console.log(pathname)
  if (pathname == "/") {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile("./index.html", function (err, text) {
      res.end(text.toString().replace(/"thew"/, thew)) 
    }) 
  } else if (pathname == "/in") {
    res.end();
  } else if (pathname == "/out") {
    console.log("out!")
    var id = _.uniqueId("listener")
    res.__my_id = id
    listeners[id] = res
    res.on('close', function () {
      delete listeners[id] 
    }) 
    res.writeHead(200, {'Content-Type': 'text/event-stream'});
  } else {
    res.end()
  }
  //res.end(JSON.stringify(query));
}).listen(1617);
console.log('server running');

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

