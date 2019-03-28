const fs = require('fs');

var cmds = [];
var aliases = [];

module.exports = class CmdArray {
  static find(a) {
    return aliases[a];
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
