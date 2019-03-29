const ConfGeneric = require('../../config/generic');
const Generic = require('../generic');

module.exports = function(discord, rcon, m, old = null) {
  var tellraw = [
    '<', { text:'@', color:'gray' }, (m.member ? m.member.displayName : m.author.username) + '> ',
    format(discord, m) ];
  if (old) {
    tellraw.push({ text:' (old: ', color: 'gray' });
    tellraw.push(format(discord, old, 'gray'));
    tellraw.push({ text:')', color: 'gray' });
  }
  var msg = '/tellraw @a [' + JSON.stringify(tellraw) + ']';
  if (ConfGeneric.debug)
    Generic.log('[> RCON]    ' + msg);
  rcon.send(msg);
  return;
};

function format(discord, m, color = 'white') {
  if (!m || !m.content)
    return "";
  var r = [], tmp = m.content.split(/(<[^<> ]*[0-9]+>)/);

  // Let's try to find any mentions in order to color them
  for (var t of tmp) {
    if  (t[0] != '<' || t[t.length - 1] != '>' || t.length < 15)
      r.push({ text:t, color: color });
    else  {
      var snowflake = t.match(/([0-9]+)>$/);
      switch (t[1]) {
        case '#':
          var c = discord.s.get(snowflake[1]);
          r.push(c && c.name ? { text:'#' + c.name, color:'white' } : { text:t, color: color });
          break;
        case'@':
          if (t[2] == '&') {
            var role = m..guild.roles.get(snowflake[1]);
            r.push(role ? { text:'@' + role.name, color:'white' } : { text:t, color: color });
            break;
          }
          var member = m..guild.members.get(snowflake[1]);
          if (member) {
            r.push({ text:'@' + member.displayName, color:'white' });
            break;
          }
          member = discord.users.get(snowflake[1]).username;
          r.push(member ? { text:'@' + member.username, color:'white' } : { text:t, color: color });
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

