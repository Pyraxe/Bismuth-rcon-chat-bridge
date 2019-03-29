const Discord = require('discord.js')

const Cmd = require('./cmd');
const Scores = require('../class/scoreboard');
const BLANK = '	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰	󠇰';



module.exports = class Scoreboard extends Cmd {
  constructor() {
    super();
    this.aliases = ['scoreboard', 'score', 's'];
  }
  process_rcon(discord, rcon, m, a) {
    this.send_rcon(rcon, '/scoreboard objectives setdisplay sidebar ' + (!a[0] || a[0] == 'clear' ? '' : a[0]));
    return true;
  }
  async process_discord(discord, rcon, m, a) {
    var obj = a[0];
    var table = (await Scores.update())[obj];
    if (!table)  {
      this.send_channel(m.channel, "`No objective was found by the name '" + obj + "'`");
      return true;
    }
    var r = [''], total = 0, padLen = 3, s;
    if (table.length > 0) {
      s = table[0].score.toLocaleString();
      padLen = s.length + 2;
      for (var entry of table) {
        r.push(entry.score.toLocaleString().padStart(padLen) + ' ' + entry.name);
        total += entry.score;
      }
    }
    r[0]= total.toLocaleString().padStart(padLen) + ' TOTAL';
    var d = new Discord.RichEmbed().setAuthor(this.aliases[0] + ' ' + obj, discord.user.displayAvatarURL);
    var str = '';
    for (var l of r) {
      if  (str.length + l.length < 1020)
        str += l + '\n';
      else {
        d.addField(BLANK, '```' + str + '```');
        str = l + '\n';
      }
    }
    if (str != '')
        d.addField(BLANK, '```' + str + '```');
    this.send_channel(m.channel, d);
    return true;
  }
}

