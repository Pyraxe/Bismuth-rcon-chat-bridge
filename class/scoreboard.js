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
    data = NBTReader.parse_nbt(await Scoreboard.getFile(), true);
    return data;
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
