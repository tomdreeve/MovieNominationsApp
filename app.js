const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const lowDb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = lowDb(new FileSync('db.json'));
db.defaults({ nominations: []}).write();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use('/', express.static('static'));
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

const apiData = {
    url: 'http://www.omdbapi.com/?apikey=7260042&',
    name: 'will',
};
const {url, name} = apiData;

const apiUrl = `${url}s=${name}`;

function search(term){
    var request = require('request');
    var options = {
    'method': 'GET',
    'url': `http://www.omdbapi.com/?apikey=7260042&s=${term}`,
    'headers': {
        'Cookie': '__cfduid=d3e5c89c64f5cb66b1bef69d3c9ccbdd91609873095'
    }
    };
    request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
    });
}

// PORT - variable part of environment in which process runs
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));