const http = require('http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// const file_client = require('filestack-js').init('AvuBjdcEvRNeVCufw3BrDz');

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const dbName  = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_DB_COLLECTION;

const dbAndCollection = {db: dbName, collection: collection};

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://hardikbhardwaj676:HHardik003@cluster0.bddhgqd.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const app = express();


app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('templates'));
app.use('/uploads', express.static('uploads'));

const port = 443;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
var upload = multer({ storage: storage });

app.listen(port);

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/pictures', (req, res) => {
    res.render("pictures");
});

app.get('/submit', (req, res) => {
    res.render("submit");
});

app.post('/submit', upload.array('profile-images', 10), async (req, res) => {
    const { name, handle, bio, school } = req.body;
    var response = '<a href="/">Home</a><br>';
    response += "Files uploaded successfully.<br>";
    for (var i = 0; i < req.files.length; i++) {
        response += `<img src="${req.files[i].path}" /><br>`;
        console.log("Picture " + i + " uploaded to: " + req.files[i].path);
    }
    try {
        const database = client.db('Cluster0');
        const collection = database.collection('applications');
        const result = await collection.insertOne({
            name,
            handle,
            bio,
            school,
        });
        res.send(response)
    } catch(e) {
        console.error(e);
        res.send("uh oh, found an error")
    } finally {
        await client.close();
    }
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
