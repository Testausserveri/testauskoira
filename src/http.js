const config = require('../config.json');
const path = require('path');
const express = require('express')
const basicAuth = require('express-basic-auth')
const app = express()

const mailRoute = require('./mail/router');
const apiRoute = require('./api/router');
app.use('/posti/', mailRoute);
app.use('/api/', apiRoute);

app.get('/joinGithub', (req, res) => {
  res.redirect('https://github.com/login/oauth/authorize?client_id=' + config.github.oauth['client_id'] + '&redirect_uri=' + config.github['redirect_uri'] + '&scope=write:org');
})
// routes after this are password-protected
app.use(basicAuth(config.http.basicAuth));

app.use(express.static(path.join(__dirname, '../control/build/')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../control/build/', 'index.html'));
});

app.listen(config.http.port, () => {
    console.log('[HTTP] Server is running port ' + config.http.port);
})

module.exports = app;