const http = require('http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const file_client = require('filestack-js').init('AvuBjdcEvRNeVCufw3BrDz');

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const dbName  = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_DB_COLLECTION;

const dbAndCollection = {db: dbName, collection: collection};

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://hardikbhardwaj676:HHardik003@cluster0.bddhgqd.mongodb.net/?retryWrites=true&w=majority";
const db_client = new MongoClient(uri);

const app = express();

app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('templates'));

const port = 443;

app.listen(port);

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/submit', (req, res) => {
    res.render("submit");
});

app.post('/submit', (req, res) => {
    const { name, handle, bio, school } = req.body;
    try {
        const database = client.db('Cluster0');
        const collection = database.collection('applications');
        res.render('confirmSubmission', {
            name,
            handle,
            bio,
            school,
        });
    } catch {
        res.send("uh oh, found an error")
    }
    res.render("confirmSubmission");
});

app.get('/errorSubmission', (req, res) => {
    res.render("errorSubmission");
});

app.get('/identity', (req, res) => {
    res.render("adminConfirm");
});

app.post('/admin', (req, res) => {
    res.render("admin");
});

app.get('/admin', (req, res) => {
    res.send("uh oh");
});
