const Discord = require('discord.js');
const RCon = require('./rcon');
const Generic = require('./class/generic');
const RConConf = require('./config/rcon');
const DiscordConf = require('./config/discord');

const DiscordMessage = require('./class/bridge/discord_message.js');
const DiscordUpdate = require('./class/bridge/discord_update.js');
const RConMessage = require('./class/bridge/rcon_message.js');
const RConResponse = require('./class/bridge/rcon_response.js');

var running = false;

const rcon = new RCon(RConConf.host, RConConf.port, RConConf.pass);
const discord = new Discord.Client();

// If RCon crash, better just exit and make use of cron reboot since it wont reconnect on its own
discord.on('error', function(e) { Generic.log('DISCORD error'); Generic.log(e); });
rcon.on('error',    function(e) { Generic.log('RCON    error'); Generic.log(e); process.exit(); });

/* LOGIN */
rcon.on('auth', function() {
  Generic.log('RCON    ok');
  Generic.log('DISCORD init');
  discord.login(DiscordConf.token);
});
discord.on('ready', function() {
  Generic.log('DISCORD ok')
  running = true;
  if (RConConf.ping) {
    Generic.log('RCON    ping start');
    setInterval(function() { rcon.send('/ping'); }, 1000 * 60);
  }
});

rcon.connect();
Generic.log('RCON    init');

rcon.on('message', (m) => RConMessage(discord, rcon, m));
rcon.on('response', (m) => RConResponse(discord, rcon, m));
discord.on('message', (m) => DiscordMessage(discord, rcon, m));
discord.on('update', (o,m) => DiscordUpdate(discord, rcon, o, m));

