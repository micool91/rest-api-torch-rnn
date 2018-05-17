const mongoose = require('mongoose');

const prodctSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, requred: true },
  price: { type: Number, required: true },
  productImage: { type: String, required: true }
});

module.exports = mongoose.model('Product', prodctSchema);