const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const lowDb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { reset } = require('nodemon');
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

async function search(term){
    var axios = require('axios');
    var res;
    var config = {
    method: 'get',
    url: `http://www.omdbapi.com/?apikey=7260042&s=${term}&type=movie&r=json`,
    headers: { 
        'Cookie': '__cfduid=d3e5c89c64f5cb66b1bef69d3c9ccbdd91609873095'
    }
    };
    try {
    const resp = await axios(config);
    return resp.data;
    } catch (error) {
    console.log(error);
    }
}

app.get('/api/:movie', async (req,res) => {
    try {
    const {movie} = req.params;
    console.log(movie);
    const data = await search(movie);
    if (data.Response === 'True' && typeof data.Search !== 'undefined'){
    console.log(data.Search)
    res.send(JSON.stringify(data.Search));
    } else res.status(404).send({ "error": "Not found, or too many results" });
    } catch (e) {
        console.log(e);
    }
});

app.delete('/api/nominate', (req, res) => {
    const {Title, Year} = req.body;
    if( (db.get("nominations").find({ Title: Title, Year: Year }).value()) ) {
        db.get("nominations").remove({ "Title": Title, "Year": Year }).write();
    } else {
        res.status(404).send({ error: 'Doesnt exist!'});
    }
    res.status(200).send({ message: 'deleted'});
})

app.get('/api/nominations/all', (req,res) => {
    const data = db.get("nominations").value();
    res.send(data);
});

app.put('/api/nominate', (req,res) => {
    const {Title, Year} = req.body;
    console.log(Title)
    if (Title === undefined && Year === undefined) {
        res.status(404).send({ error: 'No movie/year' });
    }
    if ( db.get("nominations").size().value() < 5 ){
        if( !(db.get("nominations").find({ Title: Title, Year: Year }).value()) ) {
            db.get("nominations").push({ "Title": Title, "Year": Year }).write();
        } else {
            res.status(404).send({ "error": 'Already exists!'});
        }
        res.status(200).send({ "message": 'added'});
    } else res.status(400).send({ "error": 'Max 5 nominations!'});
});

// PORT - variable part of environment in which process runs
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));