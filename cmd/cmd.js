const ConfGeneric = require('../config/generic');
const Generic = require('../class/generic');

module.exports = class Cmd {
  constructor() {
    this.aliases = [];
  }
  // Process cmd coming from DISCORD
  process_discord(discord, rcon, m, a) { return false; }
  // Process cmd coming from RCON
  process_rcon(discord, rcon, m, a)  { return false; }

  help() { return ''; }

  send_rcon(rcon, m) {
    if (ConfGeneric.debug)
      Generic.log('[> RCON]    ' + m);
    rcon.send(m);
  }
  send_channel(channel, m) {
    if (ConfGeneric.debug)
      Generic.log('[> DISCORD] ' + m);
    //channel.send(m, { disableEveryone: true });
    channel.send(m);
  }
}
