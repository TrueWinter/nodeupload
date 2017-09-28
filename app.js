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


var formidable = require('formidable'); // File upload
var express = require('express'); // Web server
var util = require('util'); // Used for response
var fs = require('fs'); // Used to move files
var path = require('path'); // Used to get file directory
var crypto = require('crypto'); // Used to generate file name
var os = require('os'); // Used to get OS tmp directory
var RateLimit = require('express-rate-limit'); // Time to ratelimit...
var sqlite3 = require('sqlite3'); // Database

var packagejson = require('./package.json');
var configstrings = require('./strings.json'); // Strings
process.title = 'NodeUpload';
console.log(`NodeUpload v${packagejson.version} \n Process ID: ${process.pid} \n Platform: ${os.type()} ${os.release()} ${os.arch()} ${os.platform()} \n Temporary Directory Location: ${path.join(os.tmpdir(), 'nodeupload_tmp')}`);
// Command line args for testing purposes.
var commandargs = process.argv.splice(2);
var command2 = commandargs[0];
if (command2 === 'test') {
  console.log('Running for 10 seconds');
  setTimeout(function () {
    console.log(configstrings.beforeStartConsole.done);
    process.exit(0);
  }, 10000);
}

var config = require('./config');
var tmpFileDir = os.tmpdir() + '/nodeupload_tmp/';
fs.access(tmpFileDir, function(err) {
  if (err) {
    console.log(configstrings.beforeStartConsole.noTMP);
    fs.mkdir(tmpFileDir, function(err) {
      if (err) {
        return console.error(configstrings.beforeStartConsole.tmpDirFail.replace('{{err}}', err));
      } //else {
      //  console.log('Temporary directory exists. Ready to go.')
      //}
    });
  } else {
    console.log(configstrings.beforeStartConsole.tmpExists);
  }
});



var app = express();

app.set('trust proxy', '127.0.0.1');

app.use(express.static('files')); // For serving files

var db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log(configstrings.beforeStartConsole.dbConnect);
});

var sqlAction = `SELECT name FROM sqlite_master WHERE type='table' AND name='tokens'`;
db.get(sqlAction, (err, row) => {
  if (!row) {
    console.log(configstrings.beforeStartConsole.dbNothing);
    db.close();
    fs.unlink(path.join(__dirname, 'db/database.db'));
    process.exit(0);
  }
});

process.on('SIGINT', function() {
  console.log('Please wait...');
  console.log('Closing database');
  db.close();
  setTimeout(function () { // Because why not
    console.log('Bye');
    process.exit(0);
  }, 500);
});

var apiRatelimiter = new RateLimit({
  windowMs: 7500, // 7.5 second window
  max: 5, // start blocking after 5 requests
  delayAfter: 0, // disable slow down of requests
  delayMs: 0,
  headers: true,
  handler: function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Retry-After', (7500 / 1000));
    console.log(configstrings.console.ratelimited.replace('{{ip}}', req.ip));
    res.status(429).json({"success": false, "message": configstrings.webStrings.ratelimited});
  }
});

app.post('/upload', apiRatelimiter, function(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.uploadDir = tmpFileDir; // Saves tmp files in tmp dir
    form.parse(req, function(err, fields, files) { // Parses form for upload
      //var uploadtoken = config.uploadtoken;
      var usertoken = '';

      if (fields.token) {
          usertoken = fields.token;
      } else {
        usertoken = req.headers.token;
      }

      //if (files.upload.name === '') {
        //console.log(configstrings.consoleStrings.noFile.replace('{{ip}}', req.ip));
        //return res.json({"success": false, "message": configstrings.webStrings.noFile});
      //}

      //var continueUpload = false;

      //var sqlAct = `SELECT token FROM tokens WHERE token = ${usertoken}`;
      //let sql = `SELECT * FROM tokens`;
      //let token = usertoken;
      function randomValueHex (length) { // Generates random string for file name
          return crypto.randomBytes(Math.ceil(length/2))
              .toString('hex') // convert to hexadecimal format
              .slice(0,length);   // return required number of characters
      }
      function startDB() {
        db.serialize(function() {
          console.log(usertoken);
          db.all(`SELECT token, enabled FROM tokens WHERE token = '${usertoken}'`, function(err, allRows) {

            if(err !== null){
               return console.log(err);
              //callback(err);

            }

              //console.log(allRows[0].token);
              //console.log(allRows[0].enabled);
              if (!allRows[0]) {
                console.log(configstrings.consoleStrings.invalidToken.replace('{{ip}}', req.ip));
                return res.json({"success": false, "message": configstrings.webStrings.invalidToken});
              }
              if (allRows[0].enabled === "1") {
                //continueUpload = true;
                if (files.upload.name === '') {
                  console.log(configstrings.consoleStrings.noFile.replace('{{ip}}', req.ip));
                  return res.json({"success": false, "message": configstrings.webStrings.noFile});
                }
                var tmpPath = files.upload.path; // Gets location of tmp file
                console.log(tmpPath);
                 var ext = require('path').extname(files.upload.name); // Gets file extension
                 if (config.extBlacklist.indexOf(ext) >= 0) {
                   console.log(configstrings.consoleStrings.blacklistExt.replace('{{ip}}', req.ip));
                   return res.json({"success": false, "message": configstrings.webStrings.blacklisted});
                 }
                 console.log(ext);

                //var filenameLength = 6;
                var fileName = randomValueHex(config.filenameLength) + ext;
                var newPath = path.join(__dirname, 'files/', fileName);
                console.log(newPath);

                  fs.rename(tmpPath, newPath, function (err) {
                    if (err) {
                      throw err;
                    }

                  });

                //res.writeHead(200, {'content-type': 'text/plain'});
                //res.write('received upload:\n\n');
                //res.write(util.inspect({fields: fields, files: files}) + '\n'); // TODO: Edit response
                res.json({"success": true, "message": fileName}); // Will not add an option to change this is `strings.json`
                //console.log(util.inspect({fields: fields, files: files}));
                console.log(configstrings.consoleStrings.uploaded.replace('{{ip}}', req.ip).replace('{{file}}', fileName).replace('{{token}}', usertoken));

                //callback(allRows);
                //db.close();
              } else {
                console.log(configstrings.consoleStrings.disabledToken.replace('{{ip}}', req.ip));
                return res.json({"success": false, "message": configstrings.webStrings.disabledToken});
              }
            });
          });
        }

        startDB();

      //if (continueUpload) { // Checks if token in body or headers is equal to real token

    });
});

app.get('/', function(req, res) {
  // show a file upload form
  console.log('Home page requested by '+ req.ip);
  if (config.indexForm) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      'Token: <input type="text" name="token"><br>'+
      '<input type="file" name="upload"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
  } else {
    res.end(config.indexFormDisabledMessage);

  }
});

app.get('/admin/deletefiles', apiRatelimiter, function(req, res) { // If you want to delete all files saved in './files' directory


//function startDB() {
  db.serialize(function() {
    //console.log(usertoken);
    db.all(`SELECT admintoken, admin FROM tokens WHERE admin = 'true' AND admintoken = '${req.headers.admintoken}'`, function(err, adminTokens) {

      if(err !== null){
         return console.log(err);
        //callback(err);

      }

      console.log(adminTokens);
      if (!adminTokens[0]) {
        console.log(configstrings.consoleStrings.invalidAdmin.replace('{{ip}}', req.ip));
        return res.json({"success": false, "message": configstrings.webStrings.invalidAdmin});
      }
      //var admintoken = config.admintoken;
        console.log(configstrings.consoleStrings.dirClear.replace('{{ip}}', req.ip));
        var fileDir = path.join(__dirname, 'files/');
        fs.readdir(fileDir, (err, files) => {
          if (err) {
            throw err;
          }
          var delFilePath = fileDir;
          for (const file of files) {
            var delFile = delFilePath + file;
            console.log(delFilePath + file);
            fs.unlink(delFile, err => {
              if (err) {
                throw err;
              }
            });
          }
        });
        res.json({"success": true, "message": configstrings.webStrings.filesDel});

        });
      });
    //};
  });



app.get('/admin/deletetmp', apiRatelimiter, function(req, res) { // For when temp files are too many


  //function startDB() {
    db.serialize(function() {
      //console.log(usertoken);
      db.all(`SELECT admintoken, admin FROM tokens WHERE admin = 'true' AND admintoken = '${req.headers.admintoken}'`, function(err, adminTokens) {

        if(err !== null){
           return console.log(err);
          //callback(err);

        }

        console.log(adminTokens);
        if (!adminTokens[0]) {
          console.log(configstrings.consoleStrings.invalidAdmin.replace('{{ip}}', req.ip));
          return res.json({"success": false, "message": configstrings.webStrings.invalidAdmin});
        }
        console.log(configstrings.consoleStrings.tmpClear.replace('{{ip}}', req.ip));

        fs.readdir(tmpFileDir, (err, files) => {
          if (err) {
            throw err;
          }

          for (const file of files) {
            fs.unlink(path.join(tmpFileDir, file), err => {
              if (err) {
                throw err;
              }
            });
          }
        });
        res.json({"success": true, "message": configstrings.webStrings.tmpDel});

        });
      });
    //}
});

app.get('*', function(req, res) {
//  var reqFile = path.join(__dirname, 'files', req.path);
  //console.log(reqFile);

  //res.sendFile(reqFile, function(err) {
    //if (err) {
    //res.send(configstrings.webStrings.reqNoFile);
  //  console.log(configstrings.consoleStrings.reqNoFile.replace('{{ip}}', req.ip).replace('{{file}}', req.path));
    //}
    //console.log(configstrings.consoleStrings.req.replace('{{ip}}', req.ip).replace('{{file}}', req.path));
  //});

  //function (req, res/*, next*/) {
    fs.access(path.join(__dirname, 'files', req.path), function(e) {
      if (e && e.code === 'ENOENT') {
        if (req.path === '/favicon.ico') {
          return;
        }
        console.log(configstrings.consoleStrings.reqNoFile.replace('{{ip}}', req.ip).replace('{{file}}', req.path));
        res.send(configstrings.webStrings.reqNoFile);
      } else {
        console.log(configstrings.consoleStrings.req.replace('{{ip}}', req.ip).replace('{{file}}', req.path));
      }
    });

    //next();
  //});

});

app.listen(config.port, function() {
  console.log(configstrings.consoleStrings.ready.replace('{{port}}', config.port));
});
