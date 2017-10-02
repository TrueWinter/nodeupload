# [NodeUpload](https://ndt3.ml/r/nodeupload) Docs
***(TEMPORARY DOCS FOR NODE UPLOAD)***


## Table of Contents

| Section | About Section |
| --- | --- |
| [Server](#server) | Requests (GET, POST...) to the server |
| [Configuration File (config.json)](#configuration-file-configjson) | Gives info about the configuration options available |
| [Strings](#strings) | Gives info about the strings.json file |

## Server

**GET /**

Returns an upload form if not disabled in configuration file

**GET /admin/deletefiles**

Headers Required:

| Header | Content |
| --- | --- |
| admintoken | \<Your Admin Token\> |

Deletes files in the files directory of NodeUpload

**GET /admin/deletetmp**

Headers Required:

| Header | Content |
| --- | --- |
| admintoken | \<Your Admin Token\> |

Deletes files from the NodeUpload temporary directory (in the operating system's temporary directory)

**POST /upload**

Headers OR Fields Required:

Headers:

| Header | Content |
| --- | --- |
| admintoken | \<Your Admin Token\> |


Fields:

| Fields | Content |
| --- | --- |
| upload | \<File\> |


Uploads a file

## Configuration File (config.json)

| Name | What it is for | Default |
| --- | --- | --- |
|filenameLength | The length of generated file names | 6 |
| port | What port NodeUpload will run on | 8099 |
| indexForm | If the upload form on / is shown | true |
| indexFormDisabledMessage | The message displayed if the upload form is disabled | Hi, this is NodeUpload. The upload form here has been disabled. Change the config file to enable it. |
| extBlacklist | An array of blacklisted file extensions | [".exe", ".sh", ".cmd", ".bat", ".html", ".htm"] |
| ratelimitAfter | Number of requests to start ratelimiting after | 5 |
| ratelimitTime | The window in which the ratelimitAfter limit applies (in milliseconds) | 7500 |
| logs.dir | The logs directory | logs |
| logs.file | The file in the logs directory | NodeUpload_log.txt |
| logs.format | The format used by the custom logger | \{\{ time \}\} \| \{\{ log \}\} \\n |

## Strings
#### NodeUpload gives users the option to customise the strings used
*String defaults are **not** given in table below to save space. If you would like the default strings, please use the [strings.json file on the NodeUpload GitHub](https://github.com/NdT3Development/nodeupload/blob/master/strings.json)*

| String | Description  | Template Strings Available\* |
| --- | --- | --- |
| beforeStartConsole.done | Test run | N/A |
| beforeStartConsole.noTMP | No temporary directory exists | N/A |
| beforeStartConsole.tmpDirFail | Failed to create temporary directory | \{\{err\}\} |
| beforeStartConsole.tmpExists | Temporary directory already exists | N/A |
| beforeStartConsole.dbConnect | Connected to the database | N/A |
| beforeStartConsole.dbNothing | Nothing in database | N/A |
| webStrings.ratelimited | Ratelimited | N/A |
| webStrings.invalidToken | Invalid upload token | N/A |
| webStrings.noFile | No file in request | N/A |
| webStrings.blacklisted | Blacklisted file extension | N/A |
| webStrings.disabledToken | Disabled token used for upload | N/A |
| webStrings.invalidAdmin | Invalid admin token | N/A |
| webStrings.filesDel | Files deleted | N/A |
| webStrings.tmpDel | Temporary files deleted | N/A |
| webStrings.reqNoFile | 404 | N/A |
| consoleStrings.ratelimited | Ratelimited | \{\{ip\}\} |
| consoleStrings.invalidToken | Invalid token | \{\{ip\}\} |
| consoleStrings.noFile | No file in request | \{\{ip\}\} |
| consoleStrings.blacklistedExt | Blacklisted file extension | \{\{ip\}\} |
| consoleStrings.disabledToken | Disabled admin token used in request | \{\{ip\}\} |
| consoleStrings.reqHome | Home page requested | \{\{ip\}\} |
| consoleStrings.reqDisabledHome | Home page with disabled form requested | \{\{ip\}\} |
| consoleStrings.invalidAdmin | Invalid admin token | \{\{ip\}\} |
| consoleStrings.dirClear | Files deleted | \{\{ip\}\} |
| consoleStrings.tmpClear | Temporary directory cleared | \{\{ip\}\} |
| consoleStrings.reqNoFile | 404 | \{\{file\}\}, \{\{ip\}\} |
| consoleStrings.req | Request | \{\{file\}\}, \{\{ip\}\} |
| consoleStrings.ready | Ready | \{\{port\}\} |
| consoleStrings.uploaded | File uploaded | \{\{ip\}\}, \{\{file\}\}, \{\{token\}\} |
| userCreate.userCreate | User creation | N/A |
| userCreate.email | Email | N/A |
| userCreate.admin | Admin token | N/A |
| userCreate.incorrect | Invalid option | N/A |
| userCreate.output | User creation output | \{\{email\}\}, \{\{token\}\}, \{\{enabled\}\}, \{\{admin\}\}, \{\{admintoken\}\} |

\**Template strings here refer to what you can use in a string and automatically have it replaced with something else in the NodeUpload code*
