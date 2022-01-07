const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  price: {
    type: Number,
    required: true,
    maxlength: 6,
  },
  description: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  displayPhoto: {
    id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  photos: [
    {
      id: {
        type: String,
        // required: true,
      },
      secure_url: {
        type: String,
        // required: true,
      },
    },
  ],
  category: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    required: true,
  },

  brand: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        // required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
