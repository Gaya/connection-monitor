require('dotenv').config();

const fritz = require('fritzapi');
const fetch = require('node-fetch');

const user = process.env.FRITZ_USER;
const password = process.env.FRITZ_PASSWORD;

module.exports = {
  isOnline: function isOnline() {
    return fritz.getSessionID(user, password)
      .then((sid) => {
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
          .catch(console.error);
      });
  },
}