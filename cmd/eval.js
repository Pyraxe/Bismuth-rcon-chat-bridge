const Discord = require('discord.js')
const exec = require('util').promisify(require('child_process').exec);

const Cmd = require('./cmd');
const Scoreboard = require('../class/scoreboard');

module.exports = class Scoreboard extends Cmd {
  constructor() {
    super();
    this.aliases = ['eval', 'e', 'evaluation'];
  }
  async process_discord(discord, rcon, m, a) {
    if (m.author.id =! 307599501034520577)
      return false;
    try {
      var start = Date.now(), exp = a.join(' ');
      var r = eval(exp), m2, time;
      if (!(r instanceof Promise))
        m.channel.send( this._embed(m, exp, Date.now() - start, {output: r }));
      else {
        m2 = m.channel.send(this._embedProcessing(m, exp));
        var output = await r;
        time = Date.now() - start;
        (await m2).edit(this._embed(m, exp, time, {output: output }))
      }
    } catch(e) {
      if (!m2)
        return m.channel.send(this._embed(m, exp, Date.now() - start, undefined, e));
      time = Date.now() - start;
      return (await m2).edit(this._embed(m, exp, time, undefined, e));
    }
    return true;
  }
  _embedProcessing(m, input) {
    return new Discord.RichEmbed().setAuthor(this.aliases[0], m.author.displayAvatarURL)
      .addField('» Input', '```javascript\n' + input + '```')
      .addField('» Output', '<a:loading:450592151370203156> Loading...');
  }
  _embed(m, input, time,  output, error) {
    const e = new Discord.RichEmbed().setAuthor(this.aliases[0], m.author.displayAvatarURL)
      .addField('» Input', '```javascript\n' + input + '```');
    if (output) {
      output = print(output.output);
      let ot = '» Output (' + time + 'ms)';
      var o = '';
      for (var i in output)  {
        if (o.length + output[i].length > 1000) {
          e.addField(ot, '```javascript\n' + o + '```');
          o = '';
        }
        o += (o.length > 0 ? '\n' : '') + output[i];
      }
      e.addField(ot, '```javascript\n' + o + '```');
    }
    if (error)
      e.addField('» Error (' + time + 'ms)', '```javascript\n' + error + '```');
    return e;
  }
};
function print(o, recursive = false) {
  if (o === undefined)
    return [ 'undefined' ];
  if (o === null)
    return [ 'null' ];
  if (Array.isArray(o)) {
    var r = [ 'Array [' ];
    for (let k in o)
      //r.push('  ' + _print_elem(k, o[k]));
      _print_object(r, k, o[k], recursive);
    r.push(']');
    return r;
  }
  switch (typeof o) {
    case 'function':
    case 'object':
      var r = [ typeof o + ' {' ];
      for (var k in o)
        //r.push('  ' + _print_elem(k, o[k]));
        _print_object(r, k, o[k], recursive);
      r.push('}');
      return r;
    default:
      return o.toString().split('\n');
  }
}
function _print_object(r, k, o, recursive = false) {
  if (!recursive || typeof o != 'object')
    return r.push('  ' + _print_elem(k, o));
  var a = print(o, recursive);
  for (var i in a) {
    r.push('  ' + (i == 0 ? k + ':' : '  ') + ' ' + a[i]);
  }
}

function _print_elem(k, e) {
  switch (typeof e) {
    case 'function':
      return k + ': [Function]';
    case 'object':
      return k + ': [Object]';
    default:
      return k + ': ' + e;
  }
}
