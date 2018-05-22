const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const trainedModelsRoutes = require('./api/routes/trainedModels');
const sampleRoutes = require('./api/routes/samples');

process.env.MONGO_ATLAS_PW = '12a007cMichal'; // TODO : get rid of this env variables !
process.env.JWT_KEY = 'ganimedes2015';

mongoose.connect('mongodb://admin:' +
    process.env.MONGO_ATLAS_PW +
    '@rest-api-torch-rnn-db-shard-00-00-28fwx.mongodb.net:27017,rest-api-torch-rnn-db-shard-00-01-28fwx.mongodb.net:27017,rest-api-torch-rnn-db-shard-00-02-28fwx.mongodb.net:27017/test?ssl=true&replicaSet=rest-api-torch-rnn-db-shard-0&authSource=admin'
);
mongoose.Promise = global.Promise;

//morgan logger
app.use(morgan('dev'));
app.use('/uploads', express.static('modelUploads'));
//encoding
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use('/trainedModels', trainedModelsRoutes);
app.use('/samples', sampleRoutes)
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

//error handling
app.use((req, res, next) => {
    const error = new Error('Coś poszło nie tak...');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;




