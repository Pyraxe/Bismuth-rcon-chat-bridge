const Cmd = require('./cmd');
const Scores = require('../class/scoreboard');

module.exports = class Scoreboard extends Cmd {
  constructor() {
    super();
    this.aliases = ['s', 'score', 'scoreboard'];
  }
  process_rcon(discord, rcon, m, a) {
    this.send_rcon(rcon, '/scoreboard objectives setdisplay sidebar ' + (!a[0] || a[0] == 'clear' ? '' : a[0]));
    return true;
  }
  async process_discord(discord, rcon, m, a) {
    var obj = a[0];
    var table = (await Scores.update())[obj];
    if (!table)  {
      this.send_channel(m.channel, "`No objective was found by the name '" + obj + "'`");
      return true;
    }
    var r = '';
    if (table.length > 0) {
      var padLen = (table[0].score + '').length;
      for (var entry of table)
        r += (entry.score + '').padStart(padLen) + ' | ' + entry.name + '\n';
    }
    this.send_channel(m.channel, '```' + r + '```');
  }
}
