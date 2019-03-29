/*
 * Message coming from DISCORD and we want to analyze and maybe send it to RCON
 */
module.exports = function(discord, rcon, o, m) {
  if (!m.guild || m.author.bot || o.content == m.content)
    return;
  //Chat bridge only  happens in one channel
  if (m.channel.id == ConfDiscord.chat_bridge_channel_id)
    DiscordToRcon(discord, rcon, m);
}
