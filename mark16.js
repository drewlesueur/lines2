//dice
// high low

var fs = require("fs")

var g = {
  __mode: "single",
  nestCount: 0,
}

//http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var mark16Get = function (a, g) {
  if (isNumber(a)) {
    return a.toString();   
  } else if (a.substr(0, 1) == ":") {
    return a.substr(1).replace(/_/g, " ")
  } else if (a.substr(0,1) == ";") {
    return a.substr(1)
  } else {
    return g[a]    
  }
}

var appendOnlyFile = "./appendonly.aof"

var mark16Set = function (a, b, g) {
  g[a] = b
  
}

var builtin = {
  add: function (args, g, builtin){
    mark16Set(args[1], mark16Get(args[2], g) + mark16Get(args[3], g), g)
  },
  subtract: function (args, g, builtin){
    mark16Set(args[1], mark16Get(args[2], g) - mark16Get(args[3], g), g)
  },
  multiply: function (args, g, builtin){
    mark16Set(args[1],  mark16Get(args[2], g) * mark16Get(args[3], g), g)
  },
  divide: function (args, g, builtin){
    mark16Set(args[1], mark16Get(args[2], g) / mark16Get(args[3], g), g)
  },
  mod: function (args, g, builtin){
    mark16Set(args[1], mark16Get(args[2], g) % mark16Get(args[3], g), g)
  },
  pow: function (args, g, builtin){
    mark16Get(args[1], Math.pow(mark16Get(args[2], g), mark16Get(args[3], g)), g)
  },
  substr: function (args, g, builtin){
    var str = mark16Get(args[2], g)
    var strLength = str.length
    var start = mark16Get(args[3], g) - 1
    if (start < 0) {
      start = strLength + 1 + start  
    }
    if (args.length == 4) {
      args[4] = strLength + 1 - start
    }
    var length = mark16Get(args[4], g) - 0

    if (length < 0) {
      length = strLength + 1 + length - start
    }
    mark16Set(args[1], str.substr(start, length) , g)
  },
  set: function (args, g, builtin) {
    mark16Set(args[1], args[2] , g)
  },
  seti: function (args, g, builtin) {
    mark16Set(mark16Get(args[1], g), mark16Get(args[2], g), g)
  },
  assert: function (args, g, builtin) {
    var val1 = mark16Get(args[1], g)
    var val2 = args[2]
    if (val1 != val2) {
      console.log("Error: " + val1 + " does not equal " + val2)  
    }
  },
  lines: function (args, g, builtin) {
    g.__key = args[1] 
    g.__text = []
    g.__mode = "multi" // multiline mode
    g.__end_str = args[2] || "end"
  },

  printi: function (args, g, builtin) {
    console.log(mark16Get(args[1], g)) 
  },
  print: function (args, g, builtin) {
    var line = args.slice(1).join(" ")
    var interpolated = line.replace(/\$(\w+)/g, function (whole, part) {
      return g[part] || ""
    })
    console.log(interpolated)
  },
  if: function (args, g, builtin) {
    var cond = mark16Get(args[1], g)
    if (cond === "1") {
      args.splice(1, 1)
      var ret =  builtin.call(args, g, builtin)   
      return ret;
    } else {
    }
  },
  not: function (args, g, builtin) {
    var val = mark16Get(args[2], g) 
    var notVal = val === "1" ? "0" : "1"
    mark16Set(args[1], notVal, g)
  },
  call: function (args, g, builtin) {
    var funcName = args[1] 
    var rest = args.slice(2).join(" ") // maybe pass in the original line here (or line could be on g)
    var code = mark16Get(args[1], g)
    var lines = code.split("\n")
    //for (var i = 0; i < lines.length - 0; i++) {
    for (var i = 0; i < lines.length - 1; i++) {
      var line = lines[i] 
      mark16EvalLine(line, g, builtin)
    } 
    var lastLine = lines[lines.length - 1]
    //return lastLine
    return lastLine
  },
  eq: function (args, g, builtin) {
    mark16Set(args[1], (mark16Get(args[2], g), mark16Get(args[3], g)) ? "1" : "0", g)
  },
  print_scope: function (args, g, builtin){
    console.log(g) 
  },
  add1: function (args, g, builtin) {
    mark16Set(args[1], mark16Get(args[1], g) || "0", g)
    mark16Set(args[1], (mark16Get(args[1], g) - 0 + 1).toString() , g)
  },
}


var mark16EvalLines = function(code, g, builtin) {
  code = code.split("\n") 
  for (var i=0; i<code.length; i++) {
    var line = code[i]    
    
    line = mark16EvalLine(line, g, builtin)
    while (line) {
      line = mark16EvalLine(line, g, builtin)
    }
  }
}

var mark16EvalLine = function (line, g, builtin) {
  g.nestCount += 1
  //console.log("nestCount:" + g.nestCount)
  var words = line.split(" ") 
  var lastLine = null
  if (g.__mode == "multi") {
    if (words[0] == g.__end_str) {
      g[g.__key] = g.__text.join("\n")
      g.__mode = "single"  
    } else {
      g.__text.push(line.substr(2)) 
    }
  } else {
    if (line == "" || line.substr(0, 1) == "#") {
    } else {
      var funcName = words[0]
      //var rest = words.slice(1).join(" ")
      var builtinFunc = builtin[funcName]
      if (builtinFunc) {
        var lastLine = builtinFunc(words, g, builtin) 
      } else if (userFunc = g[funcName]) {
        words.unshift("call")
        var lastLine = builtin.call(words, g, builtin)
      }
    }
  }
  g.nestCount -= 1
  return lastLine
}

var code = fs.readFileSync(process.argv[2]).toString()
mark16EvalLines(code, g, builtin)

