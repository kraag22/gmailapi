
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sleep = require('sleep');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

var fs = require('fs');

function main() {

  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), function(auth) {
      let promises = []
      search(auth, 'coolpeople').then(messages => {
        console.log('No:', messages.length)

        let restrict = 5000
        let sleepAfter = 0
        messages.forEach((message) => {
          sleepAfter++
          restrict = restrict - 1

          if (restrict > 0) {
            console.log('- %s', message.id)
            promises.push(getMessage(auth, message.id))
          }

          if (sleepAfter > 100) {
            sleep.sleep(5)
            sleepAfter = 0
          }
        })

        Promise.all(promises).then(values => {
          let result = values.map( item => {
            let parsed = {}
            item.payload.headers.forEach(header => {
              if (header.name === 'Subject') {
                parsed.subject = header.value
              }

              if (header.name === 'Date') {
                parsed.date = header.value
              }
            })
            return parsed
          })

          result = result.map(res => {
            var date = new Date(res.date)
            console.log(res.subject)
            console.log(res.subject.replace(/[^0-9]*/g, ''))
            var salary = parseInt(res.subject.replace(/[^0-9]*/g, ''))
            var currency = res.subject.toLocaleUpperCase().includes('CZK') ? 'CZK' : 'EUR'
            return {date, salary, currency}
          })

          result = result.filter(item => {
            return Number.isInteger(item.salary)
          })
          console.log(result)

          console.log(promises.length)
        })
      })
    });
  });
}

main()

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}

/**
 * Search messages
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function search(auth, query) {
  return new Promise( (resolve, reject) => {
    var gmail = google.gmail('v1');

      gmail.users.messages.list({
        auth: auth,
        userId: 'me',
        q: query,
        maxResults: 500,
        includeSpamTrash: true
      }, function(err, response) {
        if (err) {
          reject('The search API returned an error: ' + err)
        }
        else {
          resolve(response.messages)
        }
      });
  })
}

function getMessage(auth, id) {
  return new Promise( (resolve, reject) => {
    var gmail = google.gmail('v1');

      gmail.users.messages.get({
        auth: auth,
        userId: 'me',
        id: id,
        format: 'metadata'
      }, function(err, response) {
        if (err) {
          reject('The get message API returned an error: ' + err)
        }
        else {
          resolve(response)
        }
      });
  })
}
