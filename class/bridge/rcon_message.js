const RConToDiscord = require('./rcon_to_discord.js');
const CmdHelper = require('../cmd_helper');

/*
 * Message coming from RCON and we want to analyze and maybe send it to DISCORD.
 */
module.exports = function(discord, rcon,  m) {
  var txt = m.replace(/^<[^>]*>\s+(.*)/,'$1');
  var parse = CmdHelper.parse(txt);
  // If a command was found and returned true, then let's not send it to other chat bridge
  if (parse && parse.cmd.process_rcon(discord, rcon, m, parse.args))
    return;
  //Chat bridge only  happens in one channel
  RConToDiscord(discord, rcon, m);
}
