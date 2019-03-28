const Cmd = require('./cmd');

module.exports = class Scoreboard extends Cmd {
  constructor() {
    super();
    this.aliases = ['s', 'score', 'scoreboard'];
  }
  process_rcon(discord, rcon, m, a) {
    this.send_rcon(rcon, '/scoreboard objectives setdisplay sidebar ' + (!a[0] || a[0] == 'clear' ? '' : a[0]));
    return true;
  }
}
