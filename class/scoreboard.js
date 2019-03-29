const jsftp = require('jsftp');

const NBTReader = require('./nbtreader.js');
const FtpConf = require('../config/ftp');
const ScoreboardConf = require('../config/scoreboard');

var opt = {
  user: FtpConf.user,
  pass: FtpConf.pass,
  host: FtpConf.host,
};
var path = ScoreboardConf.ftp_path;
var nbt = null;
var data = null;
var time = 0;
var ftp = new jsftp(opt);

module.exports = class Scoreboard {
  static get() { return data; }
  static async update() {
    var t = Date.now();
    if (t - ScoreboardConf.refresh < time)
      return data;
    time = Date.now();
    nbt = NBTReader.parse_nbt(await Scoreboard.getFile(), true);
    return Scoreboard.sanitize();
  }

  static sanitize() {
    var r = {}, playerscores = nbt.data[0].data[0].data;
    for (var score of playerscores) {
      var name = score[3].data;
      var obj = score[0].data;
      var n = score[2].data;
      if (!r[obj])
        r[obj] = [];
      r[obj].push({ name: name, score: n });
    }
    for (var obj in r)
      r[obj] = r[obj].sort((a,b) => b.score - a.score);
    return (data = r);
  }

  static getFile() {
    return new Promise(resolve => {
      ftp.auth(opt.user, opt.pass, function (e,r) {
        var buffer = null;
        ftp.get(path, (e,s) => {
          if (e) {
            ftp.raw('quit', (e, d) => {});
            return resolve(null);
          }
          s.on('data', d => { buffer = buffer ? Buffer.concat([buffer, d], buffer.length + d.length) : d; });
          s.on('close', e => {
            ftp.raw('quit', (e, d) => {});
            return resolve(e ? null : buffer);
          });
          s.resume();
        });
      });
    });
  }
};

module.exports.update();
