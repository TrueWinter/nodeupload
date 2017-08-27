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

var db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});



process.on('SIGINT', function() {
  console.log('Closing database connection');
  db.close();
  setTimeout(function () {
    console.log('Database connection closed.');
    process.exit(0);
  }, 1000);
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
  console.log('User creation');

  function startDB() {
    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS tokens (email TEXT, token TEXT, enabled TEXT, admin TEXT, admintoken TEXT)");
      console.log(email);
      var stmt = db.prepare("INSERT INTO tokens (email, token, enabled, admin, admintoken) VALUES (?, ?, ?, ?, ?)");
      stmt.run(email, token, enabled, admin, admintoken);
      stmt.finalize();
      });

    db.close();
  }

  rl.question("Email: ", function(answer) {

    email = answer;
    token = uuid.v4();
    enabled = true;

    rl.question("Admin (true/false): ", function(answer) {
      admin = answer;
      console.log('Admin: ' + admin);

      if (admin === "true" || admin === "false") {

        if (admin === "true") {
          admintoken = uuid.v4();
        }
      } else {
        return console.log('Incorrect option');
      }

      console.log('Email: ' + email + '\n Token: ' + token + '\n Enabled: ' + enabled + '\n Admin: ' + admin + '\n Admin Token: ' + admintoken);

      rl.on('SIGINT', function() {
        console.log('Closing database connection');
        db.close();
        setTimeout(function () {
          console.log('Database connection closed.');
          process.exit(0);
        }, 1000);
      });

      rl.on('close', () => {
        startDB();
      });
    rl.close();

    });
  });




}, 500);
