const app = require('./app');
const https = require('https');
const http = require('http');
const fs = require('fs');

const port = process.env.PORT || 8000;

// This line is from the Node.js HTTPS documentation.
const options = {
    key: fs.readFileSync('./jakobowski_app.key'),
    cert: fs.readFileSync('./4fd2b81c3ffb17fa.crt')
};

// Create an HTTP service.
//http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(port, function () {
    console.log('listening at ' + port);
});