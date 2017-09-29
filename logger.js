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

var path = require('path');
var fs = require('fs');
var moment = require('moment');
//console.log(moment().format());

exports.console = function (f, m) {
  console.log(f.logFormat.replace('{{ time }}', moment().format()).replace('{{ log }}', m));
};
exports.file = function (f, m) {
  var dir;
  var p;

  if (f.dir) {
    dir = path.join(__dirname, f.dir);
    fs.access(dir, function(err) {
      if (err) {
        console.log("Creating logs directory now...");
        fs.mkdir(dir, function(err) {
          if (err) {
            return console.error("Error " + err);
          }
        });
      }

    });

    p = path.join(dir, f.file);
    log();
  } else {
    p = path.join(__dirname, f.file);
    log();
  }

  function log() {
    setTimeout(function () {
      var file = fs.createWriteStream(p, {flags: 'a'});
      file.write(f.logFormat.replace('{{ time }}', moment().format()).replace('{{ log }}', m) + '\n');
      //console.log(p);
    }, 50);

  }
};

exports.both = function(f, m) {
  exports.console(f, m);
  exports.file(f, m);
}
