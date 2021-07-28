const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const dataRouter = require('./routes/url');

app.use('/', dataRouter);

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})

