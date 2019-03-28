const Cmd = require('./cmd');

module.exports = class Scoreboard extends Cmd {
  constructor() {
    this.aliases = ['s', 'score', 'scoreboard'];
  }
  process_rcon(discord, rcon, m, a) {
    rcon_send('/scoreboard objectives setdisplay sidebar ' + !a[0] || a[0] == 'clear' ? '' : a[0]);
    return true;
  }
}
