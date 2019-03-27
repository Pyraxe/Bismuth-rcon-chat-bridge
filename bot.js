const Discord = require('discord.js');
const RCon = require('./rcon');
const Conf = require('./config');

var running = false;
var channel = null;

const rcon = new RCon(Conf.rcon_ip, Conf.rcon_port, Conf.rcon_pwd);
const discord = new Discord.Client();

// rcon failed, let's reboot
discord.on('error', function() {
  log('DISCORD error');
  log(e);
});
rcon.on('error', function(e) {
  log('RCON error');
  log(e);
  process.exit();
});

// rcon OK, let's log into Discord !
rcon.on('auth', function() {
  log('RCON ok');
  log('DISCORD init');
  discord.login(Conf.discord_token);
});

discord.on('ready', function() {
  log('DISCORD ok')
  channel = discord.channels.get(Conf.discord_channel);
  running = true;
  if (Conf.rcon_ping) {
    log('RCON ping start');
    setInterval(function() {
      rcon.send('/ping');
    }, 1000 * 60);
  }
});

rcon.on('response', function(m) {
  if (m) {
    if (m.match(/^No objective was found by the name '.*'$/))
      rcon_send('/tellraw @a [' + JSON.stringify({
        text: m, color:'gray'
      })+ ']');
  }
});

rcon.on('message', function(m) {
  if (!running) return;
  var msg = m.replace(/^<([^>]*)> (.*)/,'$2');
  // if scoreboard cmd
  if (msg.startsWith('s- ')) {
    var objective = msg.substring(3).replace(/ .*/,'');
    if (objective == 'clear')
      objective  = '';
    rcon_send('/scoreboard objectives setdisplay sidebar ' + objective);
    return;
  }
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

  channel_send(m);
});

function msg(m, oldm) {
  if (m.channel.id != Conf.discord_channel || m.author.bot)
    return;

  var tellraw = [
    '<', { text:'@', color:'gray' }, (m.member && m.member.nickname ? m.member.nickname : m.author.username) + '> ',
    formatMsgtoMc(m) ];
  if (oldm) {
    tellraw.push({ text:' (old: ', color: 'dark_gray' });
    tellraw.push(formatMsgtoMc(oldm, 'dark_gray'));
    tellraw.push({ text:')', color: 'dark_gray' });
  }

  rcon_send('/tellraw @a [' + JSON.stringify(tellraw) + ']');
}

discord.on('message', msg);
discord.on('messageUpdate', function(o,m){ msg(m,o); });

rcon.connect();
log('RCON init');

function formatMsgtoMc(msg, color = 'white') {
  if (msg)
  if (!msg || !msg.content)
    return "";
  var r = [], tmp = msg.content.split(/(<[^<> ]*[0-9]+>)/);
  for (var t of tmp) {
    if  (t[0] != '<' || t[t.length - 1] != '>' || t.length < 15)
      r.push({ text:t, color: color });
    else  {
      var snowflake = t.match(/([0-9]+)>$/);
      switch (t[1]) {
        case '#':
          var c = discord.channels.get(snowflake[1]);
          r.push(c && c.name ? { text:'#' + c.name, color:'aqua' } : { text:t, color: color });
          break;
        case'@':
          if (t[2] == '&') {
            var role = channel.guild.roles.get(snowflake[1]);
            r.push(role ? { text:'@' + role.name, color:'aqua' } : { text:t, color: color });
            break;
          }
          var member = channel.guild.members.get(snowflake[1]);
          if (member) {
            r.push({ text:'@' + (member.nickname ? member.nickname : member.user.username), color:'aqua' });
            break;
          }
          member = discord.users.get(snowflake[1]).username;
          r.push(member ? { text:'@' + member.username, color:'aqua' } : { text:t, color: color });
          break;
        case ':':
          r.push(t.substring(1,t.length - snowflake[1].length - 1));
          break;
        default:
          r.push({ text:t, color: color });
      }
    }
  }
  return r;
}

function log(msg) { console.log('[' + (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':') + '] ', msg); }
function rcon_send(msg) {
  if (Conf.debug)
    log('[> RCON]    ' + msg);
  rcon.send(msg);
}
function channel_send(msg) {
  if (Conf.debug)
    log('[> DISCORD] ' + msg);
  channel.send(msg, { disableEveryone: true, tts: false });
}


