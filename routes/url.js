const router = require('express').Router();
const cors = require('cors');


const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dburi = process.env.ATLAS_URI;
const hosturi = process.env.HOST_URL;


var corsOptions = {
    origin: 'https://m-shotener.netlify.app',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.get('/shortner', cors(corsOptions), async (req, res) => {
    let client = await mongoClient.connect(dburi);
    try {
        let db = client.db('shortner');
        const existingUrl = await db.collection('urls').find({ url: req.body.url }).toArray();
        if (existingUrl.length) {
            res.status(409).json('Shortened URL already exists for this site: ' + existingUrl[0].short);
        } else {
            var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for (var i = 0; i < 7; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            let newUrl = {
                url: req.body.url,
                code: result,
                // short: `${hosturi}+${result}`
            }
            const saveData = await db.collection('urls').insertOne(newUrl);
            if (saveData) {
                res.status(200).send(`${hosturi}${result}`);
            }
        }

    } catch (error) {
        res.status(400).json('Error: ' + error);
    } finally {
        client.close();
    }
})

//shortner url
router.post('/shortner', cors(corsOptions), (async (req, res) => {
    let client = await mongoClient.connect(dburi);
    try {
        let db = client.db('shortner');
        const existingUrl = await db.collection('urls').find({ url: req.body.url }).toArray();
        if (existingUrl.length) {
            res.status(409).json('Shortened URL already exists for this site: ' + existingUrl[0].short);
        } else {
            var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = '';
            for (var i = 0; i < 7; i++) {
                result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
            }
            let newUrl = {
                url: req.body.url,
                code: result,
                // short: `${hosturi}+${result}`
            }
            const saveData = await db.collection('urls').insertOne(newUrl);
            if (saveData) {
                res.status(200).send(`${hosturi}${result}`);
            }
        }

    } catch (error) {
        res.status(400).json('Error: ' + error);
    } finally {
        client.close();
    }
}))


//redirect to url
router.get('/:shortUrl', cors(corsOptions), (async (req, res) => {
    let client = await mongoClient.connect(dburi);
    let reqUrl = req.params.shortUrl;
    try {
        let db = client.db('shortner');
        let existingUrl = await db.collection('urls').find({ code: reqUrl }).toArray();
        if (existingUrl.length) {
            res.status(200).json(existingUrl[0].url);
        } else {
            res.status(404).json(`No URL Found: ${hosturi}`);
        }

    } catch (error) {
        res.status(400).json('Error: ' + error);
    } finally {
        client.close();
    }
}))

module.exports = router;
