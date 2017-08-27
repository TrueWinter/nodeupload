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
var sqlite3 = require('sqlite3');


// Command line args for testing purposes.
var commandargs = process.argv.splice(2);
var command2 = commandargs[0];
if (command2 === 'test') {
  console.log('Running for 10 seconds');
  setTimeout(function () {
    console.log('Done');
    process.exit(0);
  }, 10000);
}

var config = require('./config');
var tmpFileDir = os.tmpdir() + '/nodeupload_tmp/';
fs.access(tmpFileDir, function(err) {
  if (err) {
    console.log('NodeUpload temporary directory not found or no permissions to access it. Attempting to create it now.');
    fs.mkdir(tmpFileDir, function(err) {
      if (err) {
        return console.error('Failed to create directory' + err);
      } //else {
      //  console.log('Temporary directory exists. Ready to go.')
      //}
    });
  } else {
    console.log('Temporary directory exists. Ready to go.');
  }
});



var app = express();

app.set('trust proxy', '127.0.0.1');

var db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

var sqlAction = `SELECT name FROM sqlite_master WHERE type='table' AND name='tokens'`;
db.get(sqlAction, (err, row) => {
  if (!row) {
    console.log('There is nothing in the database. Please run createUser.js to create a new user');
    db.close();
    fs.unlink(path.join(__dirname, 'db/database.db'));
    process.exit(0);
  }
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
    console.log(req.ip + ' was ratelimited');
    res.status(429).json({"success": false, "message": "Ratelimited (too many requests)"});
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

      //if (files.upload === '') {
      //  console.log(req.ip + ' tried to upload nothing');
      //  return res.json({"success": false, "message": "No file in request"});
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

              console.log(allRows[0].token);
              console.log(allRows[0].enabled);
              if (!allRows[0]) {
                console.log(req.ip + ' tried to upload with an incorrect token');
                return res.json({"success": false, "message": "Invalid token"});
              }
              if (allRows[0].enabled === "1") {
                //continueUpload = true;
                if (!files.upload) { // Checks if there is a file in request
                  console.log(req.ip + ' tried to upload without a file');
                  return res.json({"success": false, "message": "No file in request"});
                }
                var tmpPath = files.upload.path; // Gets location of tmp file
                console.log(tmpPath);
                 var ext = require('path').extname(files.upload.name); // Gets file extension
                 if (ext === '.exe' || ext === '.html' || ext === '.bat' || ext === '.cmd' || ext === '.sh') {
                   console.log(req.ip + ' tried to upload a file with a blacklisted extension');
                   return res.json({"success": false, "message": "Blacklisted file extension"});
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

                res.writeHead(200, {'content-type': 'text/plain'});
                res.write('received upload:\n\n');
                res.write(util.inspect({fields: fields, files: files})); // TODO: Edit response
                res.end('\nFile uploaded: ' + fileName);
                console.log(util.inspect({fields: fields, files: files}));

                //callback(allRows);
                //db.close();
              } else {
                console.log(req.ip + ' tried to upload with a disabled token');
                return res.json({"success": false, "message": "Token disabled"});
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
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    'Token: <input type="text" name="token"><br>'+
    '<input type="file" name="upload"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
});

app.get('/admin/deletefiles', apiRatelimiter, function(req, res) { // If you want to delete all files saved in './files' directory


//function startDB() {
  db.serialize(function() {
    //console.log(usertoken);
    db.all(`SELECT token FROM tokens WHERE admintoken = '${req.headers.admintoken}'`, function(err, adminTokens) {

      if(err !== null){
         return console.log(err);
        //callback(err);

      }

      console.log(adminTokens);
      if (!adminTokens[0]) {
        console.log(req.ip + ' tried to upload with an incorrect token');
        return res.json({"success": false, "message": "Invalid token"});
      }
      //var admintoken = config.admintoken;
        console.log(req.ip + ' requested a file directory clear');
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
        res.json({"success": true, "message": "Files deleted"});

        });
      });
    //};
  });



app.get('/admin/deletetmp', apiRatelimiter, function(req, res) { // For when temp files are too many


  //function startDB() {
    db.serialize(function() {
      //console.log(usertoken);
      db.all(`SELECT token FROM tokens WHERE admintoken = '${req.headers.admintoken}'`, function(err, adminTokens) {

        if(err !== null){
           return console.log(err);
          //callback(err);

        }

        console.log(adminTokens);
        if (!adminTokens[0]) {
          console.log(req.ip + ' tried to upload with an incorrect token');
          return res.json({"success": false, "message": "Invalid token"});
        }
        console.log(req.ip + ' requested a file directory clear');

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
        res.json({"success": true, "message": "Temporary files deleted"});

        });
      });
    //}
});

app.get('*', function(req, res) {
  var reqFile = path.join(__dirname, 'files', req.path);
  //console.log(reqFile);

  res.sendFile(reqFile, function(err) {
    if (err) {
      res.send('404 File Not Found');
      return console.log('File `' + req.path + '` requested by `' + req.ip + '` but not found');
    }
    console.log('File `' + req.path + '` requested by `' + req.ip + '`');
  });
});

app.listen(config.port, function() {
  console.log('Ready to go on port ' + config.port);
});
