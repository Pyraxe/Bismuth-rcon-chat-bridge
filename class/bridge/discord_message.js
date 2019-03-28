const DiscordToRcon = require('./discord_to_rcon.js');
const ConfDiscord = require('../../config/discord');
const CmdHelper = require('./cmd_helper');

/*
 * Message coming from DISCORD and we want to analyze and maybe send it to RCON
 */
module.exports = function(discord, rcon, m) {
  if (!m.guild || m.author.bot)
    return;
  var parse = CmdHelper.parse(m.content);
  // If a command was found and returned true, then let's not send it to other chat bridge
  if (parse && parse.cmd.process_discord(discord, rcon, m, parse.args)
    return;
  //Chat bridge only  happens in one channel
  if (m.channel.id == ConfDiscord.chat_bridge_channel)
    DiscordToRcon(discord, rcon, m);
}
