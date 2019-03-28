const jsftp = require('jsftp');

const NBTReader = require('./nbtreader.js');
const Conf = require('./config');

module.exports = class Scoreboard {
  constructor() {
    this.opt = {
      user: Conf.ftp_user,
      pass: Conf.ftp_pwd,
      host: Conf.ftp_ip,
    };
    this.path = Conf.ftp_scoreboard_path;
    this.ftp = new jsftp(this.opt);
    Scoreboard.data = null;
    this.time = 0;
    this.update();
  }

  async update() {
    var t = Date.now();
    if (t - this.scoreboard_refresh < this.time)
      return;
    this.time = Date.now();
    Scoreboard.data = NBTReader.parse_nbt(await this.getFile(), true);
    return;
  }

  getFile() {
    return new Promise(resolve => {
      var sc = this;
      this.ftp.auth(this.opt.user, this.opt.pass, function (e,r) {
        var buffer = null;
        sc.ftp.get(sc.path, (e,s) => {
          if (e) {
            sc.ftp.raw('quit', (e, d) => {});
            return resolve(null);
          }
          s.on('data', d => { buffer = buffer ? Buffer.concat([buffer, d], buffer.length + d.length) : d; });
          s.on('close', e => {
            sc.ftp.raw('quit', (e, d) => {});
            return resolve(e ? null : buffer);
          });
          s.resume();
        });
      });
    });
  }
};
var sc = new module.exports();
