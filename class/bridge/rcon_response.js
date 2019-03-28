/*
 * Message coming from RCON as an anwser to a RCON command previously sent
 */
module.exports = function(rcon, discord, m) {
  if (!m)
    return;
  if (m.match(/^No objective was found by the name '.*'$/))
    rcon_send('/tellraw @a [' + JSON.stringify({ text: m, color:'gray' })+ ']');
}
