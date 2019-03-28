const fs = require('fs');
const DiscordConf = require('../config/discord');

var cmds = [];
var aliases = [];

module.exports = class CmdHelper {
  static find(a) {
    return aliases[a];
  }
  static parse(msg) {
    if (!m.startsWith(DiscordConf.prefix))
      return false;
    var split = get_args(msg.substring(DiscordConf.prefix.length));
    var args = split.slice(1), aliase = split[0];
    var cmd = CmdHelpers.find(aliase);
    if (!cmd)
      return false;
    return { aliase: cmd, args: args, cmd: cmd };
  }
}

// Lets find all .js classes in ../cmd/
// We create one objectt per filee and store it in cmds
fs.readdirSync('../cmd/').forEach(f => {
  var s = fs.lstatSync('../cmd/' + f);
  if (!s.isDirectory() && f.length > 3 && f.slice(f.length - 3) == '.js') {
    s = f.substring(0, f.length - 3);
    var c = new require('../cmd/' + f)();
    cmds.push(c);
    for (var a of c.aliases)
      aliases[a] = c;
  }
});

function get_args(s) {
  var r = [];
  var w = '';
  function addword()  {
    if (w.length > 0) {
      r.push(w);
      w = '';
    }
  }
  for (var i = 0, c = s.length; i < c; ++i) {
    // If char is a white space, it means the end of a world which is to be added.
    if (/\s/.test(s[i])) {
      addword();
    // Not a white space, it's a standard char.
    } else {
      switch (s[i]) {
        case '"':
        //case "'":
          var start = s[i];
          while (++i < c && s[i] != start) {
            switch (s[i]) {
              case '\\':
                var nexti = i + 1;
                // If next char is an escapable char, let's escape it and add it to our word.
                if (nexti < c && (s[nexti] == start))
                  ++i;
              default:
                w += s[i];
            }
          }
          break;
        case '\\':
          var nexti = i + 1;
          // If next char is an escapable char, let's escape it and add it to our word.
          if (nexti < c && s[nexti] == '"')
          //if (nexti < c && (s[nexti] == '"' || s[nexti] == "'"))
            ++i;
        default:
          w += s[i];
      }
    }
  }
  addword();
  //console.log(r);
  return r;
  //return s.split(/\s+/).filter( function(e) { return e.trim().length > 0; } );
}
