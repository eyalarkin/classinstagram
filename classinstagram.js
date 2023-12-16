const http = require('http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const ngrok = require('ngrok');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

process.stdin.setEncoding('utf8');

const dbAndCollection = {db: 'Cluster0', collection: 'applications'};

const { MongoClient, ServerApiVersion } = require('mongodb');
const { emitWarning } = require('process');

const uri = "mongodb+srv://hardikbhardwaj676:HHardik003@cluster0.bddhgqd.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const app = express();

const accessToken = 'EAAIxmAYWMmEBOZCXzLtVhxg6fJiUaEuc5eL1afZBxshV02emTfqK9eOQoeVtkx7ZCS7HT6ZAGbA0bciAFKDqMWIIKhQDuFCt5iDaZBWpfdWgPfdzgetPgmtoqygm3wHNZBe2I6VEBcIO4t76TT86rZBGmB1w5cNPD1yLddHc0vQuCy1EaSDDpneVtRBi1YzjAlX';
const accountID = '17841457828060732';

app.set('views', path.resolve(__dirname, 'templates'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('templates'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());

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
    var pics = new Array();
    response += "Files uploaded successfully.<br>";
    for (var i = 0; i < req.files.length; i++) {
        pics.push(req.files[i].path);
        response += `<img src="${req.files[i].path}"><br>`;
        console.log("Picture " + i + " uploaded to: " + req.files[i].path);
    }
    try {
        await client.connect();
        const database = client.db('Cluster0');
        const collection = database.collection('applications');
        const result = await collection.insertOne({
            name: name,
            handle: handle,
            bio: bio,
            school: school,
            images: pics
        });
        res.send(response)
    } catch(e) {
        console.error(e);
        res.send("uh oh, found an error")
    } finally {
        await client.close();
    }
});

app.post('/rejectClick', async (req, res) => {
    const database = client.db('Cluster0');
    const collection = database.collection('applications');
    try {
        await client.connect();
        let filter = {handle: req.body.handle};
        const result = await collection.deleteOne(filter);
        console.log('Deleted this user: ', req.body.handle);
        res.sendStatus(201);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
});

app.post('/approveClick', async (req, res) => {
    const database = client.db('Cluster0');
    const collection = database.collection('applications');
    try {
        await client.connect();
        let filter = {handle: req.body.handle};
        let person = req.body;
        if (person.images.length == 1) {
            url = 'https://class-instagram.onrender.com/' + person.images[0];
            containerID = await createSingleItem(url, person.bio);
            if (containerID) {
                success = await postSingleItem(containerID);
                if (success) {
                    const result = await collection.deleteOne(filter);
                    console.log('Approved and deleted this user: ', person.handle);
                    res.sendStatus(201);
                } else {
                    console.error("couldn't make post for %s", person.handle);
                }
            } else {
                console.error("couldn't make container for %s", person.handle);
            }
        } else if (person.images.length > 1) {
            postIDs = [];
            for (i = 0; i < person.images.length; i++) {
                postID = await createCarouselItem(person.images[i]);
                postIDs.push(postID);
            }
            containerID = createCarousel(postIDs, person.bio);
            if (containerID) {
                success = postCarousel(containerID);
                if (success) {
                    const result = await collection.deleteOne(filter);
                    console.log('Approved and deleted this user: ', req.body.handle);
                    res.sendStatus(201);
                } else {
                    console.error("couldn't post carousel for %s", person.handle);
                }
            } else {
                console.error("couldn't create carousel container for %s", person.handle);
            }

        } else {
            console.error("no images in person %s", person.handle);
        }

    } catch (e) {
        console.error(e);
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

app.post('/admin', async (req, res) => {
    try {
        const database = client.db('Cluster0');
        const collection = database.collection('applications');

        const result = await listAll(client, collection);
        console.log(`Found: ${result.length} people`);
        console.log(result);
        fs.writeFile("uploads/data.json", JSON.stringify(result), function(err) {
            if (err) {
                console.log(err);
            }
        });
        res.render("admin");
    } catch (e) {
        console.error(e);
        res.send("uh oh, found an error");
    } finally {
        await client.close();
    }

});

app.get('/admin', (req, res) => {
    res.send("uh oh");
});

const prompt = "classinstagram:  ";
process.stdout.write(prompt);
process.stdin.on("readable", async function () {
    let input = process.stdin.read();
    if (input != null) {
        let cmd = input.trim();
        if (cmd == "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else if (cmd == "list") {
            const database = client.db('Cluster0');
            const collection = database.collection('applications');
            const result = await listAll(client, collection);
            console.log(result);
        } else {
            process.stdout.write("Invalid command: " + cmd + "\n");
        }
        process.stdout.write(prompt);
        process.stdin.resume();
    }
});

async function listAll(client, collection) {
    await client.connect();
        let filter = {};
        const cursor = collection.find(filter);

        const result = await cursor.toArray();

        return result;
}

async function createCarouselItem(imageUrl) {
    const result = await axios.post(`https://graph.facebook.com/v18.0/${accountID}/media?image_url=${imageUrl}&is_carousel_item=true&access_token=${accessToken}`);
    if (result.data.id) {
        return result.data.id;
    } else {
        console.log(result.data);
        return null;
    }
}

async function createCarousel(postIDs, caption){
    pics = ""
    for (i = 0; i < postIDs.length; i++) {
        if (i != postIDs.length - 1) {
            pics += postIDs[i] + '%2C';
        } else {
            pics += postIDs[i];
        }
    }
    const result = await axios.post(`https://graph.facebook.com/v18.0/${accountID}/media?caption=${caption}&media_type=CAROUSEL&children=${pics}&access_token=${accessToken}`);
    if (result.data.id) {
        return result.data.id;
    } else {
        console.log(result.data);
        return null;
    }
}

async function postCarousel(carouselID) {
    const result = await axios.post(`https://graph.facebook.com/v18.0/${accountID}/media_publish?creation_id=${carouselID}&access_token=${accessToken}`);
    if (result.data.id) {
        return true;
    } else {
        console.log(result.data);
        return false;
    }
}

async function createSingleItem(imageUrl, caption) {
    const result = await axios.post(`https://graph.facebook.com/v18.0/${accountID}/media?image_url=${imageUrl}&caption=${caption}&access_token=${accessToken}`);
    if (result.data.id) {
        return result.data.id;
    } else {
        console.log(result.data);
        return null;
    }
}

async function postSingleItem(containerID) {
    const result = await axios.post(`https://graph.facebook.com/v18.0/${accountID}/media_publish?creation_id=${containerID}&access_token=${accessToken}`);
    if (result.data.id) {
        return true;
    } else {
        console.log(result.data);
        return false;
    }
}
