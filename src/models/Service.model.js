const mongoose = require("mongoose");
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: { type: String },
  price: { type: Number },
  images: [{ type: String }],
  description: { type: String },
  available: { type: Boolean },
  promotion: {
    type: new Schema(
      {
        type: { type: Boolean },
        dates: {
          type: new Schema(
            {
              start: { type: Date },
              end: { type: Date },
            },
            { _id: false },
          ),
        },
        value: { type: Number },
      },
      { _id: false },
    ),
  },
  category: { type: String },
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "business",
    required: false,
    autopopulate: false,
  },
});

module.exports = mongoose.model("Service", ServiceSchema);
