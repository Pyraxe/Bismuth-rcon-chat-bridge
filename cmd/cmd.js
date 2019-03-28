module.exports = class Cmd {
  constructor() {
    this.aliases = [];
  }
  // Process cmd coming from DISCORD
  process_discord(discord, rcon, m, a) { return false; }
  // Process cmd coming from RCON
  process_rcon(discord, rcon, m, a)  { return false; }
  help() { return ''; }
}
