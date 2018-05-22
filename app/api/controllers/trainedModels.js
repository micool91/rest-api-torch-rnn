const TrainedModel = require('../models/trainedModel');
const mongoose = require('mongoose');
const fs = require('fs');
const unique = require('array-unique');


exports.get_models_all = (req, res, next) => {
    TrainedModel.find()
        .select('name author genre description _id pathImage pathT7 pathJson numLayers rnnSize user')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                trainedModels: docs.map(doc => {
                    return {
                        name: doc.name,
                        author: doc.author,
                        genre: doc.genre,
                        description: doc.description,
                        _id: doc._id,
                        pathImage: doc.pathImage,
                        pathT7: doc.pathT7,
                        pathJson: doc.pathJson,
                        numLayers: doc.numLayers,
                        rnnSize: doc.rnnSize,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/trainedModels/' + doc._id
                        }
                    }
                })
            }
            if (docs.length >= 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: 'Nie znaleziono wytrenowanych modeli.'
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}


exports.post_model = (req, res, next) => {
    console.log(req.files);
    const nowyModel = new TrainedModel({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        author: req.body.author,
        genre: req.body.genre,
        description: unique(req.body.description.split('\n')),
        pathImage: req.files['pathImage'][0].filename,
        pathT7: req.files['pathT7'][0].path,
        pathJson: req.files['pathJson'][0].path,
        numLayers: req.body.numLayers,
        rnnSize: req.body.rnnSize,
        user: req.userData.userId
    });
    nowyModel
        .save()
        .then(result => {
            return res.status(201).json({
                message: "Dodano wytrenowany model do bazy.",
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}


exports.get_model = (req, res, next) => {
    const id = req.params.trainedModelId;
    TrainedModel.findById(id)
        .select('name author genre description _id pathImage pathT7 pathJson numLayers rnnSize user')
        .exec()
        .then(doc => {
            console.log("Pobrano z bazy wytrenowany model: ", doc);
            if (doc) {
                res.status(200).json({
                    trainedModel: doc,
                    request: {
                        type: 'GET',
                        description: 'GET dla wszystkich wytrenowanych modeli',
                        url: 'http://localhost:8000/trainedModels'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'Nie znaleziono wytrenowanego modelu dla podanego ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}


exports.edit_model = (req, res, next) => {
    const id = req.params.trainedModelId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    TrainedModel.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                messsage: 'Model został zmieniony.',
                request: {
                    type: 'GET',
                    url: 'http://localhost:8000/trainedModels/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}


exports.delete_model = (req, res, next) => {
    const id = req.params.trainedModelId;
    console.log(id);
    TrainedModel.findById(id)
        .select('name author genre description _id pathImage pathT7 pathJson numLayers rnnSize user')
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                fs.unlink(doc.pathJson, (err) => {
                    //if (err) throw err;   TODO: deal with errors???
                    console.log('Usunięto: ' + doc.pathJson);
                });
                fs.unlink(doc.pathT7, (err) => {
                    //if (err) throw err;
                    console.log('Usunięto: ' + doc.pathT7);
                });
                fs.unlink(doc.pathImage, (err) => {
                    //if (err) throw err;
                    console.log('Usunięto: ' + doc.pathImage);
                });
                TrainedModel.remove({ _id: id })
                    .exec()
                    .then(result => {
                        return res.status(200).json({
                            message: 'Model został usunięty.',
                            request: {
                                type: 'POST',
                                url: 'http://localhost:8000/trainedModels',
                                body: {
                                    name: 'String', author: 'String', genre: 'String' // TODO: Form Data zamiast body??
                                }
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500)({
                            error: err
                        });
                    });
            } else {
                res.status(404).json({
                    message: 'Nie znaleziono wytrenowanego modelu dla podanego ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500)({
                error: err
            });
        });
}


exports.get_models_by_user = (req, res, next) => {
    TrainedModel.find( { user: req.userData.userId } )
        .select('name author genre description _id pathImage pathT7 pathJson numLayers rnnSize user')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                trainedModels: docs.map(doc => {
                    return {
                        name: doc.name,
                        author: doc.author,
                        genre: doc.genre,
                        description: doc.description,
                        _id: doc._id,
                        pathImage: doc.pathImage,
                        pathT7: doc.pathT7,
                        pathJson: doc.pathJson,
                        numLayers: doc.numLayers,
                        rnnSize: doc.rnnSize,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8000/trainedModels/' + doc._id
                        }
                    }
                })
            }
            if (docs.length >= 0) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: 'Nie znaleziono wytrenowanych modeli.'
                });
            }

        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
}
