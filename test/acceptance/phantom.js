var spawn = require('child_process').spawn;
var wd = require('wd');

var DEFAULT_PORT = 4444;
var DEBUG = process.env['ACCEPTANCE_DEBUG'];

var processes = [];

module.exports = function Phantom(port) {
  var self = {};

  port = port || DEFAULT_PORT;
  self.name = 'phantomjs';
  self.url = 'http://localhost:' + port + '/status';
  self.startServer = function(cb) {
    var subprocess = spawn('phantomjs', ['--webdriver=' + port], {
      stdio: DEBUG ? 'pipe' : 'ignore'
    });
    if (DEBUG) {
      subprocess.stdout.on('data', function(data){
        console.log('PHANTOMJS STDOUT:', data.toString());
      });
      subprocess.stderr.on('data', function(){
        console.log('PHANTOMJS STDERR:', data.toString());
      });
    }
    subprocess.on('close', function(code) {
      processes.splice(processes.indexOf(subprocess), 1);
      if (code !== 0)
        return cb(new Error("phantomjs exited with code " + code));
      cb(null);
    });
    processes.push(subprocess);
    return subprocess;
  };
  self.createWebdriver = function() {
    return wd.remote("localhost", port);
  };

  return self;
};

module.exports.stopAll = function() {
  processes.forEach(function(subprocess) {
    subprocess.kill();
  });
};
