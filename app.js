var formidable = require('formidable');
var express = require('express');
var util = require('util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var os = require('os');

var app = express();

app.post('/upload', function(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.uploadDir = os.tmpdir() + '/nodeupload_tmp/';
    form.parse(req, function(err, fields, files) {
      if (files.upload.name === '') {
        return res.send('No file included');
      }
      var tmpPath = files.upload.path;
      console.log(tmpPath);
       var ext = require('path').extname(files.upload.name);
       console.log(ext);
      function randomValueHex (length) {
          return crypto.randomBytes(Math.ceil(length/2))
              .toString('hex') // convert to hexadecimal format
              .slice(0,length).toUpperCase();   // return required number of characters
      }
      var fileName = randomValueHex(6) + ext;
      var newPath = path.join(__dirname, 'files/', fileName);
      console.log(newPath);
      if (fields.token === 'token') {
        fs.rename(tmpPath, newPath, function (err) {
          if (err) throw err;

        });
      } else {
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

app.listen('8080', function() {
  console.log('Ready to go');
});
