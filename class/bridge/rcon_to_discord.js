const ConfDiscord = require('../../config/discord');
const ConfGeneric = require('../../config/generic');
const Generic = require('../generic');

var channel = null;

module.exports = function(discord, rcon, m) {
  if (!channel)
    channel = discord.channels.get(ConfDiscord.chat_bridge_channel_id);
  m = m.replace(/^<([^>]*)>(.*)/,'<`$1`> $2');
  var mentions = m.match(/@([^ ]+)/gi);
  if (mentions)
    for (mention of mentions) {
      var name = mention.substring(1);
      var t = channel.guild.members.find(m => m.displayName == name);
      if (t) {
        m = m.replace(mention, '<@' + t.id + '>');
        continue;
      }
      t = discord.users.find(u => u.username == name);
      if (t) {
        m = m.replace(mention, '<@' + t.id + '>');
        continue;
      }
      t = channel.guild.roles.find(r => r.name == name);
      if (t) {
        m = m.replace(mention, '<@&' + t.id + '>');
        continue;
      }
    }
  mentions = m.match(/#([^ ]+)/gi);
  if (mentions)
    for (mention of mentions) {
      var name = mention.substring(1);
      var t = channel.guild.channels.find(c => c.name == name);
      if (t) {
        m = m.replace(mention, '<#' + t.id + '>');
        continue;
      }
    }
  var emojis = m.match(/:([^ ]+):/gi);
  if (emojis)
    for (emoji of emojis) {
      var name = emoji.substring(1, emoji.length - 1);
      var e = discord.emojis.find(e => e.name == name);
      if (e) {
        m = m.replace(emoji, `${e}`);
        continue;
      }
    }

  if (ConfGeneric.debug)
    Generic.log('[> DISCORD] ' + m);
  discord.channels.get(ConfDiscord.chat_bridge_channel).send(m);
}
