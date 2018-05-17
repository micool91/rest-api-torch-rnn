const mongoose = require('mongoose');

const trainedModelSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    description: {type: [String] },
    pathImage: { type: String, required: true },
    pathT7: { type: String, required: true },
    pathJson: { type: String, required: true },
    numLayers: { type: Number, required: true },
    rnnSize: { type: Number, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('TrainedModel', trainedModelSchema);