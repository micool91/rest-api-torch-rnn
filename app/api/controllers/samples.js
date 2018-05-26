const Sample = require('../models/sample');
const TrainedModel = require('../models/trainedModel');
const mongoose = require('mongoose');

const { exec } = require('child_process');
const unique = require('array-unique');

exports.get_samples_all = (req, res, next) => {
    Sample.find()
        .select('trainedModel text textLength temperature _id user')
        .populate('trainedModel', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                samples: docs.map(doc => {
                    return {
                        _id: doc._id,
                        trainedModel: doc.trainedModel,
                        textLength: doc.textLength,
                        text: doc.text,
                        temperature: doc.temperature,
                        user: doc.user,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/samples/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.get_samples_by_model = (req, res, next) => {
    Sample.find( { trainedModel: req.params.trainedModelId } )
        .select('trainedModel text textLength temperature _id user')
        .populate('trainedModel', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                samples: docs.map(doc => {
                    return {
                        _id: doc._id,
                        trainedModel: doc.trainedModel,
                        textLength: doc.textLength,
                        text: doc.text,
                        temperature: doc.temperature,
                        user: doc.user,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/samples/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.post_sample = (req, res, next) => {
    TrainedModel.findById(req.body.trainedModelId)
        .then(trainedModel => {
            if (!trainedModel) {
                return res.status(404).json({
                    message: 'Nie znaleziono wytrenowanego modelu'
                });
            } else {
                const genLength = req.body.textLength;
                const genTemperature = req.body.temperature;
                const modelId = req.body.trainedModelId;
                const genPathT7 = trainedModel.pathT7;
                const genPathJson = trainedModel.pathJson;
                generateData(genPathT7, genLength, genTemperature, function (str) {
                    console.log('wszedłem2');
                    // Split into lines, remove the first and last lines and any duplicates
                    const parts = unique(str.split('\n').slice(1, -1))
                        .filter(s => s.length > 1);     // Remove lines 1 character or less
                        //.slice(0, 10)                  // Take a maximum of 10 lines
                        //.map(s => s); // Wrap in paragraph tags
                    console.log(parts.join("\n"));
                    const sample = new Sample({
                        _id: mongoose.Types.ObjectId(),
                        text: parts,
                        textLength: genLength,
                        temperature: genTemperature,
                        trainedModel: modelId,
                        user: req.userData.userId
                    });
                    sample.save();
                    console.log(sample);
                    res.status(201).json({
                        message: 'Wygenerowano sampl\'a',
                        generatedSample: {
                            _id: sample._id,
                            trainedModel: sample.trainedModel,
                            text: sample.text,
                            temperature: sample.temperature
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/samples/' + sample._id
                        }
                    });
                });
            }
        })

}

exports.generuj_text = (req, res) => {
    let autor = req.body.city;
    console.log(autor);

    console.log("wywolane gemnerowanie");
    let temperature = 1;
    console.log('wszedłem1');
    // Fetch data
    generateData('/app/sample_checkpoints/checkpoint_172200.t7', '2000', temperature, function (str) {
        console.log('wszedłem2');
        // Split into lines, remove the first and last lines and any duplicates
        const parts = unique(str.split('\n').slice(1, -1))
            .filter(s => s.length > 1)     // Remove lines 1 character or less
            .slice(0, 10)                  // Take a maximum of 10 lines
            .map(s => s); // Wrap in paragraph tags

        const title = 'Title:';
        console.log(parts.join("\n"));
        res.render('generowanie.ejs', { weather: parts, error: null });
    });
}

exports.get_sample = (req, res, next) => {
    Sample.findById(req.params.sampleId)
        .populate('trainedModel')
        .exec()
        .then(sample => {
            if (!sample) {
                return res.status(404).json({
                    message: 'Nie znalezniono sampl\'a'
                });
            }
            res.status(200).json({
                sample: sample,
                request: {
                    type: 'GET',
                    url: 'http://localhost:8000/samples'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.delete_sample = (req, res, next) => {
    Sample.remove({ _id: req.params.sampleId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Usunięto sampla',
                request: {
                    type: "POST",
                    url: "http://localhost:8000/samples",
                    body: { trainedModelId: 'ID', temperature: "Number" }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

let when = {};
let cached = {};

function generateData(cp, l, t, cb) {
    const now = Date.now();
    const key = `${cp}${t}`;
    console.log('cp: ' + cp + ', length: ' + l + ', temperature: ' + t);
    if (!when[key]) {
        when[key] = 0;
    }

    // Cache results for 10 seconds
    if (now - when[key] > 10000 || !cached[key]) {
        when[key] = now;
        try {
            console.log(`cd /root/torch-rnn && th sample.lua -checkpoint /app/${cp} -length ${l} -gpu -1 -temperature ${t}`);
            exec(`cd /root/torch-rnn && th sample.lua -checkpoint /app/${cp} -length ${l} -gpu -1 -temperature ${t}`, function (err, str) {
                if (err) {
                    console.error(err);
                    cb('');
                } else {
                    cached[key] = str;
                    cb(cached[key]);
                }
            });
        } catch (e) {
            console.error(e);
            cb('');
        }
    } else {
        cb(cached[key]);
    }
}

exports.get_samples_by_userId = (req, res, next) => {
    Sample.find( { user: req.userData.userId } )
        .select('trainedModel text textLength temperature _id user')
        .populate('trainedModel', 'name')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                samples: docs.map(doc => {
                    return {
                        _id: doc._id,
                        trainedModel: doc.trainedModel,
                        textLength: doc.textLength,
                        text: doc.text,
                        temperature: doc.temperature,
                        user: doc.user,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/samples/' + doc._id
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}



exports.post_sample_without_save = (req, res, next) => {
    TrainedModel.findById(req.body.trainedModelId)
        .then(trainedModel => {
            if (!trainedModel) {
                return res.status(404).json({
                    message: 'Nie znaleziono wytrenowanego modelu'
                });
            } else {
                const genLength = req.body.textLength;
                const genTemperature = req.body.temperature;
                const modelId = req.body.trainedModelId;
                const genPathT7 = trainedModel.pathT7;
                const genPathJson = trainedModel.pathJson;
                generateData(genPathT7, genLength, genTemperature, function (str) {
                    console.log('wszedłem2');
                    // Split into lines, remove the first and last lines and any duplicates
                    const parts = unique(str.split('\n').slice(1, -1))
                        .filter(s => s.length > 1);     // Remove lines 1 character or less
                        //.slice(0, 10)                  // Take a maximum of 10 lines
                        //.map(s => s); // Wrap in paragraph tags
                    console.log(parts.join("\n"));
                    const sample = new Sample({
                        _id: mongoose.Types.ObjectId(),
                        text: parts,
                        textLength: genLength,
                        temperature: genTemperature,
                        trainedModel: modelId,
                    });
                    console.log(sample);
                    res.status(201).json({
                        message: 'Wygenerowano sampl\'a',
                        generatedSample: {
                            _id: sample._id,
                            trainedModel: sample.trainedModel,
                            text: sample.text,
                            temperature: sample.temperature
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/samples/' + sample._id
                        }
                    });
                });
            }
        })

}