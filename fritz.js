require('dotenv').config();

const fritz = require('fritzapi');
const fetch = require('node-fetch');

const user = process.env.FRITZ_USER;
const password = process.env.FRITZ_PASSWORD;

let currentSid = null;

module.exports = {
  isOnline: function isOnline() {
    function fetchIsOnline(sid) {
      const body = new URLSearchParams();

      body.append('xhr', 1);
      body.append('xhrId', 'diag');
      body.append('sid', sid);
      body.append('lang', 'en');
      body.append('page', 'funcCheck');
      body.append('diagID', 'uiInternet');
      body.append('reqCnt', 1);
      body.append('useajax', 1);
      body.append('no_sidrenew', '');

      return fetch('http://192.168.178.1/data.lua', { method: 'POST', body })
        .then((res) => res.json())
        .then((data) => data.data.diag.is_box_online)
        .catch(() => {
          currentSid = null;
          return isOnline();
        });
    }

    function getSid() {
      if (currentSid) {
        return Promise.resolve(currentSid);
      }

      return fritz.getSessionID(user, password)
        .then((sid) => {
          currentSid = sid;
          return sid;
        });
    }

    return getSid()
      .then((sid) => fetchIsOnline(sid));
  },
}