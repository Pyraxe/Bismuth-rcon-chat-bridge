const Discord = require('discord.js')

const Cmd = require('./cmd');
const Scores = require('../class/scoreboard');

const BLANK = '	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰';

module.exports = class Slist extends Cmd {
  constructor() {
    super();
    this.aliases = ['lstat', 'list', 'l'];
  }
  process_rcon(discord, rcon, m, a) {
    var user = m.match(/^<([^>]*)>/)[1];
    var matches = [], table = Scores.get();
    for (var obj in table) {
      // If arg empty (everything then) or contained
      if (!a.length || obj.toLowerCase().includes(a[0].toLowerCase()))
        matches.push(obj);
    }
    matches.sort();
    var msg = '/tellraw ' + user + ' [' + JSON.stringify({text:matches.length + ' match' + (matches.length > 1 ? 'es': ''), color:'gray'}) + ']';
    this.send_rcon(rcon, msg);
    msg = JSON.stringify({text:matches.join(', '), color:'gray'});
    if (matches.length > 0)
      this.send_rcon(rcon, '/tellraw ' + user + ' [' + (msg.length < 1000 ? msg : JSON.stringify({text: 'Too many matches', color:'gray'})) + ']');
    //var msg = '/tellraw @a [' + JSON.stringify(tellraw) + ']';
    return true;
  }
  async process_discord(discord, rcon, m, a) {
    var matches = [], table = Scores.get();
    for (var obj in table) {
      // If arg empty (everything then) or contained
      if (!a.length || obj.toLowerCase().includes(a[0].toLowerCase()))
        matches.push(obj);
    }
    matches.sort();
    var d = new Discord.RichEmbed().setAuthor(this.aliases[0] + ' ' + a[0], discord.user.displayAvatarURL)
      .setFooter('(' + matches.length + ' match' + (matches.length > 1 ? 'es' : '') +')'), str = '', tot = 0;
    for (var obj of matches) {
      if (str.length + obj.length + 2 > 1020) {
        if (d.fields.length >= 4)
          break;
        d.addField(BLANK, str);
        str = '';
      }
      tot++;
      str += (str.length ? ', ' : '') + obj;
    }
    d.addField(BLANK, str);
    if (str.length && d.fields.length >= 5)
      d.setFooter('(' + tot + '/' + matches.length + ' match' + (tot > 1 ? 'es' : '') + ')');
    try {
      await this.send_channel(m.channel, d);
    } catch(e) {
      this.send_channel(m.channel, 'Too many matches (' + matches.length + ') to be displaid');
    }
    return true;
  }
}

