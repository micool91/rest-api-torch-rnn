const mongoose = require('mongoose');

const sampleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: { type: [String], required: false },
    textLength: { type: Number, required: true },
    temperature: { type: Number, required: true },
    trainedModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainedModel',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Sample', sampleSchema);