var uuid = require('uuid');
var readline = require('readline');
var sqlite3 = require('sqlite3');




var db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
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
  rl.question("Email: ", function(answer) {

    email = answer;
    token = uuid.v4();
    enabled = true;

    rl.question("Admin (true/false): ", function(answer) {
      admin = answer;
      console.log('Admin: ' + admin);

      if (admin === "true") {
        admintoken = uuid.v4();
      }

      console.log('Email: ' + email + '\n Token: ' + token + '\n Enabled: ' + enabled + '\n Admin: ' + admin + '\n Admin Token: ' + admintoken);

      //rl.on('close', () => {
      //  startDB();
      //})
    //rl.close();

    });
  });

function startDB() {
  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS tokens (email TEXT, token TEXT, enabled TEXT, admin TEXT, admintoken TEXT)");
    console.log(email);
    var stmt = db.prepare("INSERT INTO tokens (email, token, enabled, admin, admintoken) VALUES (?, ?, ?, ?, ?)");
    stmt.run(email, token, enabled, admin, admintoken);
    stmt.finalize();
    });

  db.close();
};


}, 500);
