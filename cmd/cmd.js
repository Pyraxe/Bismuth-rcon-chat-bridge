module.exports = class Cmd {
  constructor() {
    this.aliases = [];
  }
  process_discord(discord, m) { return false; }
  process_rcon(rcon, m)  { return false; }
  help() { return ''; }
}
