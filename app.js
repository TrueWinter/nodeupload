var formidable = require('formidable'); // File upload
var express = require('express'); // Web server
var util = require('util'); // Used for response
var fs = require('fs'); // Used to move files
var path = require('path'); // Used to get file directory
var crypto = require('crypto'); // Used to generate file name
var os = require('os'); // Used to get OS tmp directory
var RateLimit = require('express-rate-limit'); // Time to ratelimit...
var sqlite3 = require('sqlite3');

var config = require('./config');
var tmpFileDir = os.tmpdir() + '/nodeupload_tmp/';
var app = express();


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
    fs.unlink(path.join(__dirname, 'db/database.db'));
    process.exit(0);
  }
});



db.close();
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
      var uploadtoken = config.uploadtoken;
      if (fields.token === uploadtoken || req.headers.token === uploadtoken) { // Checks if token in body or headers is equal to real token
      if (!files.upload) { // Checks if there is a file in request
        console.log(req.ip + ' tried to upload without a file');
        return res.json({"success": false, "message": "No file in request"});
      }
      var tmpPath = files.upload.path; // Gets location of tmp file
      console.log(tmpPath);
       var ext = require('path').extname(files.upload.name); // Gets file extension
       console.log(ext);
      function randomValueHex (length) { // Generates random string for file name
          return crypto.randomBytes(Math.ceil(length/2))
              .toString('hex') // convert to hexadecimal format
              .slice(0,length);   // return required number of characters
      }
      var filenameLength = config.filenameLength;
      var fileName = randomValueHex(filenameLength) + ext;
      var newPath = path.join(__dirname, 'files/', fileName);
      console.log(newPath);

        fs.rename(tmpPath, newPath, function (err) {
          if (err) throw err;

        });
      } else {
        console.log(req.ip + ' tried to upload with an incorrect token');
        return res.json({"success": false, "message": "Invalid token"});
      }
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.write(util.inspect({fields: fields, files: files})); // TODO: Edit response
      res.end('\nFile uploaded: ' + fileName)
      console.log(util.inspect({fields: fields, files: files}));
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
  var admintoken = config.admintoken;
  if (req.headers.admintoken === admintoken) { // Checks if token in body or headers is equal to real token
    console.log(req.ip + ' requested a file directory clear');
    var fileDir = path.join(__dirname, 'files/');
    fs.readdir(fileDir, (err, files) => {
      if (err) throw error;

      for (const file of files) {
        fs.unlink(path.join(fileDir, file), err => {
          if (err) throw error;
        });
      }
    });
    res.json({"success": true, "message": "Files deleted"});
  } else {
    console.log(req.ip + ' requested a file directory clear without valid token');
    return res.json({"success": false, "message": "Invalid admin token"});
  }
});

app.get('/admin/deletetmp', apiRatelimiter, function(req, res) { // For when temp files are too many
  var admintoken = config.admintoken;
  if (req.headers.admintoken === admintoken) { // Checks if token in body or headers is equal to real token
    console.log(req.ip + ' requested a file directory clear');

    fs.readdir(tmpFileDir, (err, files) => {
      if (err) throw error;

      for (const file of files) {
        fs.unlink(path.join(tmpFileDir, file), err => {
          if (err) throw error;
        });
      }
    });
    res.json({"success": true, "message": "Temporary files deleted"});
  } else {
    console.log(req.ip + ' requested a file directory clear without valid token');
    return res.json({"success": false, "message": "Invalid admin token"});
  }
});

app.get('*', function(req, res) {
  var reqFile = path.join(__dirname, 'files', req.path);
  //console.log(reqFile);

  res.sendFile(reqFile, function(err) {
    if (err) {
      res.send('404 File Not Found');
      return console.log('File \`' + req.path + '\` requested by \`' + req.ip + '\` but not found');
    }
    console.log('File \`' + req.path + '\` requested by \`' + req.ip + '\`');
  });
});

app.listen('8099', function() {
  console.log('Ready to go');
});
