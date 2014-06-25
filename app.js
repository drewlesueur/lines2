// todo linux domain socket
// do both websockets and sse (event source)
// 64x64 operating system
//redis based.


var thew = 32 
var theh = thew
var themillis = 50
var http = require("http")

var redis = require("redis")
var client = redis.createClient()
client.get("drew", function (err, val) {
  console.log(val)
})

var font1 = {
  a: ["    ",
      " xx ",
      "x x ",
      "x x ",
      " xx ",
  ],
  b: ["x   ",
      "xx  ",
      "x x ",
      "x x ",
      "xx  ",
  ],
  c: ["    ",
      " xx ",
      "x   ",
      "x   ",
      " xx ",
  ],
  c: ["    ",
      " xx ",
      "x   ",
      "x   ",
      " xx ",
  ],
}

var filled = function (color, ret) {
  var tot = thew * theh
  for (var i = 0; i < tot; i++) {
    ret.push(color) 
  }
  return ret;
}

var drawText = function (x,y, text, color, canvas) {
  var _x = x
  var _y = y
  for (var i = 0; i < text.length; i++) {
    var chr = text.charAt(i)
    var pixels = font1[chr] // letter
    for (var pixeli = 0; pixeli < pixels.length; pixeli++) {
      var row = pixels[pixeli];  
      for (var rowi = 0; rowi < row.length; rowi++) {
        var chr = row.charAt(rowi)
        if (chr == "x") {
          canvas[((y + pixeli) * theh) + x + rowi] = color
        }
      }
    }    
    x += pixels[0].length
  } 
}


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

var oldTick = function () {
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
}

var printable = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=:;,.?<>{}[]"
var compress = function (colors) {
  var ret = []
  var lastColor = ""
  var count = 0
  var colorTable = {}
  var colorList = []
  var colorTableIndex = - 1
  for (var i = 0; i <= colors.length; i++) {
    var color = colors[i]
    if (!colorTable[color] && colorTable[color] !== 0 && i != colors.length) {
      colorTableIndex += 1
      colorTable[color] = printable.charAt(colorTableIndex)
      colorList.push(color)
    }

    if (color != lastColor && i != 0) {
      var countString = count == 1 ? "" : count.toString()
      ret.push(colorTable[lastColor] + countString)
      count = 1
    } else {
      count+= 1
    }
    lastColor = color
  }
 
  ret = colorList.join("|") + " " +  ret.join("");
  return ret;
}

var c = 0
var getMessageJson = function () {
  var colors = []
  var letters = []
  var w = thew
  var h = w
  c += 1
  if (c > 800) {c = 0}
  //letters = "hello world".split("")

  filled("00cc00", colors)
  drawText(c,0, "abcabc", "fff", colors)
  drawText(c + 12,8, "abcabc", "ff0", colors)
  drawText(Math.round(c * 1) + 20,16, "abcabc", "00f", colors)

  //filled(1, colors)
  //drawText(c,0, "abcabc", 0, colors)
  var compressed = compress(colors)
  //console.log(compressed)
  var ret = {
    //x: 0,
    //y: 0,
    //w: w,
    //h: h,
    //colors: colors,
    c: compress(colors) ,
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

