const notifier = require('node-notifier');
const path = require('path');
const fs = require('fs');
const dns = require('dns');
const fritz = require('./fritz');

let isConnected = null;
let isFritzConnected = null;

function writeLog(message = '') {
  if (message === '') {
    return;
  }

  fs.appendFile(
    path.join(__dirname, 'log'),
    `${new Date().toISOString()}: ${message}\n`,
    () => console.info(message),
  );
}

function notify(title, message) {
  notifier.notify({
    title,
    message,
    icon: path.join(__dirname, 'icons', 'offline.png'),
    sound: true,
  });
}

function checkConnection() {
  dns.resolve('www.google.com', function(err) {
    const isCurrentlyConnected = !err;

    if (isCurrentlyConnected !== isConnected && isConnected !== null) {
      notify(
        isCurrentlyConnected ? 'Internet connection restored' : 'Internet connection offline',
        isCurrentlyConnected ? 'You have restored your Internet connection' : 'You lost your Internet connection',
      );

      writeLog(
        isCurrentlyConnected ? 'Connected' : 'Offline',
      );
    }

    // update state
    isConnected = isCurrentlyConnected;

    setTimeout(checkConnection, 1000);
  });
}

function checkFritz() {
  fritz.isOnline()
    .then((isOnline) => {
      if (isOnline !== isFritzConnected && isFritzConnected !== null) {
        notify(
          isOnline ? 'Fritz Internet connection restored' : 'Fritz Internet connection offline',
          isOnline ? 'Fritz has an Internet your connection' : 'Fritz lost its Internet connection',
        );

        writeLog(
          isOnline ? 'Fritz Connected' : 'Fritz Offline',
        );
      }

      // update state
      isFritzConnected = isOnline;

      setTimeout(checkFritz, 1000);
    })
    .catch((err) => {
      writeLog(`Fritz error: ${err}`);
      setTimeout(checkFritz, 1000);
    });
}

checkConnection();
checkFritz();