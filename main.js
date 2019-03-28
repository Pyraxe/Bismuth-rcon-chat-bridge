const Discord = require('discord.js');
const RCon = require('./rcon');
const RConConf = require('./config/rcon');

const DiscordMessage = require('./class/bridge/discord_message.js');
const DiscordUpdate = require('./class/bridge/discord_update.js');
const RConMessage = require('./class/bridge/rcon_message.js');
const RConResponse = require('./class/bridge/rcon_response.js');

var running = false;
function log(msg) { console.log('[' + (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':') + '] ', msg); }

const rcon = new RCon(RConConf.host, RConConf.port, RConConf.pass);
const discord = new Discord.Client();

// If RCon crash, better just exit and make use of cron reboot since it wont reconnect on its own
discord.on('error', function(e) { log('DISCORD error'); log(e); });
rcon.on('error',    function(e) { log('RCON    error'); log(e); process.exit(); });

/* LOGIN */
rcon.on('auth', function() {
  log('RCON    ok');
  log('DISCORD init');
  discord.login(Conf.discord_token);
});
discord.on('ready', function() {
  log('DISCORD ok')
  running = true;
  if (RConConf.ping) {
    log('RCON    ping start');
    setInterval(function() { rcon.send('/ping'); }, 1000 * 60);
  }
});

rcon.connect();
log('RCON    init');

rcon.on('message', (m) => RConMessage(m));
rcon.on('response', (m) => RConResponse(m));
discord.on('message', (m) => DiscordMessag(m));
discord.on('update', (m) => DiscordUpdate(m));

