module.exports = class Generic {
  log(msg) { console.log('[' + (new Date()).toJSON().slice(0, 19).replace(/[-T]/g, ':') + '] ', msg); }
}
