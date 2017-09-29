/*
Project Name: NodeUpload
Project Developer: NdT3Development
Project GitHub: https://github.com/NdT3Development/nodeupload
Project Info: https://github.com/NdT3Development/nodeupload#node-upload

Project License:
MIT License

Copyright (c) 2017 NdT3Development

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var uuid = require('uuid');
var readline = require('readline');
var sqlite3 = require('sqlite3');
var configstrings = require('./strings.json');
var os = require('os');
var packagejson = require('./package.json');
var config = require('./config.json');
var logger = require('./logger.js').both;
var logConf = {
  dir: config.logs.dir,
  file: config.logs.file,
  logFormat: config.logs.format
}
function log(m) {
  logger(logConf, m);
}

process.title = 'NodeUpload User Creation';
log(`NodeUpload v${packagejson.version} User Creation \n Process ID: ${process.pid} \n Platform: ${os.type()} ${os.release()} ${os.arch()} ${os.platform()}`);
var db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  log(configstrings.beforeStartConsole.dbConnect);
});

setTimeout(function () { // Because I don't know what else to do to stop it from trying to connect while asking questions and making the questions not work
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  var email;
  var token;
  var enabled;
  var admin;
  var admintoken;
  log(configstrings.userCreate.userCreate);

  function startDB() {
    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS tokens (email TEXT, token TEXT, enabled TEXT, admin TEXT, admintoken TEXT)");
      log(email);

      db.all(`SELECT * FROM tokens WHERE email = '${email}'`, function(err, allRows) {
          if (!allRows[0]) {
            var stmt = db.prepare("INSERT INTO tokens (email, token, enabled, admin, admintoken) VALUES (?, ?, ?, ?, ?)");
            stmt.run(email, token, enabled, admin, admintoken);
            stmt.finalize();
          } else {
            return log("Already exists in database");
          }
          db.close();
      });


      });

  }

  rl.question(configstrings.userCreate.email, function(answer) {

    email = answer;
    token = uuid.v4();
    enabled = true;

    rl.question(configstrings.userCreate.admin, function(answer) {
      admin = answer;
      //log('Admin: ' + admin);

      if (admin === "true" || admin === "false") {

        if (admin === "true") {
          admintoken = uuid.v4();
        }
      } else {
        return log(configstrings.userCreate.incorrect);
      }

      log(configstrings.userCreate.output
        .replace('{{email}}', email)
        .replace('{{token}}', token)
        .replace('{{enabled}}', enabled)
        .replace('{{admin}}', admin)
        .replace('{{admintoken}}', admintoken));

      rl.on('close', () => {
        startDB();
      });
    rl.close();

    });
  });




}, 500);
