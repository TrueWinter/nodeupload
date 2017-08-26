# Node Upload
Decided to start from scratch using a different dependency for uploading. Basics are working yet this is **NOT** ready for use in a production environment.

**All screenshots use the tokens from the first GIF under the installing section**

### Installing
This project is not quite ready for public use yet, however, if you can use it if you want to.

```sh
npm install
node createUser.js # This is the script for creating users
node app.js
```

![InstructionsGIF](https://i.imgur.com/gMNDSZC.gif)

### Creating a New User
After you are done installing and your friend also wants to use this, run the following command and answer the questions.

```sh
node createUser.js
```

### Usage

Once the server has started, open a web browser to `YOUR_IP:8099` (there will be an option to configure this at some time).

If everything worked, it should show an upload form. Just add your token where it says `Token`, choose a file to upload, then click the button. It should upload. If not, check the console for errors. You may need to open an issue here.

![UsageGIF](https://i.imgur.com/bZqbH0t.png)

#### Admin Tools

There are also some admin tools (currently, deleting files and temporary files). These require an admin token which you get from answering `true` to the `Admin` question when running `createUser.js`.

You will need to use a program that can send headers with a GET request. I prefer using [Postman](https://getpostman.com).

 **Delete files in 'files' directory:**
  - Make a GET request to `YOUR_IP:8099/admin/deletefiles` including a header with your admin token with the name `admintoken`.
  ![DeleteFiles](https://i.imgur.com/aVtL3d7.png)

  **Delete files in temporary directory (`OPERATING_SYSTEM_TMP/nodeupload_tmp/`)**
  - Make a GET request to `YOUR_IP:8099/admin/deletetmp` including a header with your admin token with the name `admintoken`.
  ![DeleteTMP](https://i.imgur.com/XXUjU38.png)

### KNOWN ISSUES
If you get an error like this after uploading, please manually create a directory called `nodeupload_tmp` in your operating system's tmp directory: ![Error1](https://i.imgur.com/TrdaOsK.png)

#### Other Issues
You may come across some of these while using this.

- EACCES (Permission denied): Make sure that you have permissions to access files in that directory.

- EADDRINUSE (Address already in use):
![NodeEADDRINUSE](https://i.imgur.com/gjOM9Vp.png)
Make sure that there is no application running that is using that port. If you don't know what process is using the port, run the following **(LINUX ONLY)** `netstat -peanut | grep 'PORT_HERE'` then run `kill 'PROCESS_ID'` (The process ID will be in a format like `12345/process`)
![KillProcess](https://i.imgur.com/zlgFpew.png)

- ENOENT (No such file or directory):
![NoNodeUploadTMP](https://i.imgur.com/lxe00fe.png)
You should not find this as NodeUpload should automatically create a new directory if none is found. However, if you do find this issue, make a new directory named `nodeupload_tmp` in your operating system's tmp directory.

- ENOENT after installing dependencies: You may see an error that looks like this after installing the dependencies:
![SQLiteENOENT](https://i.imgur.com/bhJ7BbG.png)
To fix this, delete the `node_modules` directory and run `npm install` again.

- The program 'node' is currently not installed.
![NodeNotInstall](https://i.imgur.com/xUHT8FJ.png)
Follow the instructions [here](https://nodejs.org/en/download/package-manager/)

- The program 'npm' is currently not installed.
Same as above.

### Please note:
**THIS HAS NOT BEEN TESTED YET IN A PRODUCTION ENVIRONMENT. DATABASE FEATURES NOT FULLY TESTED. ALL DEVELOPMENT TESTS WERE RUN ON LINUX MINT 17.3 64 BIT USING NODE V8.4.0 AND NPM 5.3.0**

### LICENSE
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
