// todo linux domain socket
// do both websockets and sse (event source)
// 64x64 operating system
//redis based.


var thew = 64
var theh = 32
var themillis = 30
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
}

var setPixel = function (x, y, color, ret) {
  ret[y*thew + x] = color 
}

//var filled = function (color, ret) {
//  var tot = thew * theh
//  for (var i = 0; i < tot; i++) {
//    ret.push(color) 
//  }
//  return ret;
//}

var filled = function (color, ret) {
  var tot = thew * theh
  for (var y = 0; y < theh; y++) {
    for (var x = 0; x < thew; x++) {
      setPixel(x, y, color, ret) 
    } 
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
          setPixel(x + rowi, y + pixeli, color, canvas)
          //canvas[((y + pixeli) * thew) + x + rowi] = color
        }
      }
    }    
    x += pixels[0].length
  } 
}
var drawingCommands = {
  filled: filled,
  drawText: drawText
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

var filled2 = function (color, dd) {
  filled(color, dd.colors)
  dd.commands.push(["f", color])
}

var drawText2 = function (x, y, text, color, dd) {
  drawText(x, y, text, color, dd.colors)
  dd.commands.push(["t", x, y, text, color])
}

var c = 0
var getMessageJson = function () {
  var colors = []
  var letters = []
  var w = thew
  var h = theh
  c += 1
  if (c > 64) {c = 0}
  //letters = "hello world".split("")
  var dd = {commands: []} 
  dd.colors = colors
  filled2("00cc00", dd)
  drawText2(c,0, "abc", "fff", dd)
  drawText2(c + 12,8, "abcabc", "ff0", dd)
  drawText2(Math.round(c * 1) + 20,16, "abcabc", "00f", dd)

  //filled(1, colors)
  //drawText(c,0, "abcabc", 0, colors)
  //console.log(compressed)
  var ret = {
    //x: 0,
    //y: 0,
    w: thew,
    h: theh,
    //colors: colors,
    //c: compress(colors) ,
    i: dd.commands,
  }
  var stringified = JSON.stringify(ret)
  //console.log(stringified)
  return stringified
}

var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 1618});

setInterval(function ( ){
  _.each(listenersWs, function (ws, id) {
    if (ws.__shouldClose) {
      try {
        ws.close()
        delete listenersWs[id] 
      } catch (e) {
        console.log("error closing " + id)
      }
      console.log("closing " + id)
    } 
    ws.__shouldClose = true
  })
}, 5000)

wss.on('connection', function(ws) {
  var id = _.uniqueId("listener")
  ws.__my_id = id
  listenersWs[id] = ws
  ws.on('close', function () {
    delete listenersWs[id] 
  }) 
  ws.__shouldClose = true
  ws.on('message', function(message) {
    ws.__shouldClose = false
    console.log(message)
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
      res.end(text.toString().replace(/"thew"/, thew).replace(/"theh"/, theh)) 
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

//process.on('uncaughtException', function(err) {
//  console.log('Caught exception: ' + err);
//});

