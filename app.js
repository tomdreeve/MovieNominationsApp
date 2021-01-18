const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
const lowDb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = lowDb(new FileSync('db.json'));
db.defaults({ nominations: [], users: [] }).write();

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
    const {User, Title, Year} = req.body;
    console.log(Title);
    console.log(db.get("nominations").find({ Owner: User }).get("picks").find({ Title: Title, Year: Year }).value())
    if((db.get("nominations").find({ Owner: User }).get("picks").find({ Title: Title, Year: Year }).value()) ) {
        db.get("nominations").find({ Owner: User }).get("picks").remove({ "Title": Title, "Year": Year }).write();
    } else {
        res.status(404).send({ error: 'Doesnt exist!'});
    }
    res.status(200).send({ message: 'deleted'});
})

app.get('/api/nominations/all/:user', (req,res) => {
    const {user} = req.params;
    const data = db.get("nominations").find({ Owner: user }).get("picks").value();
    res.send(data);
});

app.put('/api/nominate', (req,res) => {
    const {User, Title, Year, Poster} = req.body;

    if (Title === undefined && Year === undefined) {
        res.status(404).send({ error: 'No movie/year' });
    }
    var noms = db.get("nominations").find({ Owner: User }).get("picks");

    if ( noms.size().value() < 5 ){
        if( !(noms.find({ Title: Title, Year: Year }).value()) ) {
            if (Poster === "N/A"){
                noms.push({ "Title": Title, "Year": Year }).write();
            } else {
                noms.push({ "Title": Title, "Year": Year, "Poster": Poster }).write();
            }
        } else {
            res.status(404).send({ "error": 'Already exists!'});
        }
        res.status(200).send({ "message": 'added'});
    } else res.status(400).send({ "error": 'Max 5 nominations!'});
});

app.put('/api/new/user', (req,res) => {
    const {User} = req.body;
    if (User === undefined) {
        res.status(404).send({ error: 'No user entered' });
    }
    if( !(db.get("users").find({ Name : User}).value()) ) {
        db.get("users").push({ "Name": User }).write();
        db.get("nominations").push({ "Owner": User, "picks": [] }).write();
    } else {
        res.status(404).send({ "error": 'Already exists!'});
    }
    res.status(200).send({ "message": 'added'});
});

app.get('/api/login/:user', (req,res) => {
    const {user} = req.params;
    if (user === undefined) {
        res.status(404).send({ error: 'No user entered' });
    }
    if((db.get("users").find({ Name : user}).value()) ) {
        res.status(200).send({ "Message": 'Logged in'});
    } else {
        res.status(404).send({ "error": 'Already exists!'});
    }
});

app.get('/api/posters/all', (req,res) => {
    const noms = db.get("nominations").value();
    var poster = [];
    for (var i = 0; i < noms.length; i++) {
        var picks = noms[i].picks;
        for (var x = 0; x < picks.length; x++){
            if (picks[x].Poster){
                poster.push(picks[x].Poster);
            }
        }
    }
    console.log(poster);
    res.send(poster);
})

// PORT - variable part of environment in which process runs
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));