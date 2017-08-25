var formidable = require('formidable'); // File upload
var express = require('express'); // Web server
var util = require('util'); // Used for response
var fs = require('fs'); // Used to move files
var path = require('path'); // Used to get file directory
var crypto = require('crypto'); // Used to generate file name
var os = require('os'); // Used to get OS tmp directory

var config = require('./config');
var app = express();

app.post('/upload', function(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.uploadDir = os.tmpdir() + '/nodeupload_tmp/'; // Saves tmp files in tmp dir
    // TODO: Daily clean of uploadDir directory with tmp files
    form.parse(req, function(err, fields, files) { // Parses form for upload
      var uploadtoken = config.uploadtoken;
      if (fields.token === uploadtoken || req.headers.token === uploadtoken) { // Checks if token in body or headers is equal to real token
      if (!files.upload) { // Checks if there is a file in request
        console.log(req.ip + ' tried to upload without a file');
        return res.send('No file included');
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
        return res.send('Token incorrect');
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
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
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
