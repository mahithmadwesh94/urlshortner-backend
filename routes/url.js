const router = require('express').Router();
const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const dburi = process.env.ATLAS_URI;
const hosturi = process.env.HOST_URL;


//shortner url
router.route('/shortner').post(async (req, res) => {
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


//redirect to url
router.route('/:shortUrl').get(async (req, res) => {
    let client = await mongoClient.connect(dburi);
    let reqUrl = req.params.shortUrl;
    try {
        let db = client.db('shortner');
        let existingUrl = await db.collection('urls').find({ code: reqUrl }).toArray();
        console.log(existingUrl);
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
})

module.exports = router;