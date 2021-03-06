const mongoose = require("mongoose");

const { Schema } = mongoose;

const statuses = ["sent", "in_revision", "reviewed", "observed", "cancelled"];

const SupportSchema = new Schema(
     {
          seen: { type: Boolean, default: false },
          assigned: { type: String }, //email
          code: { type: String },

          idClient: {
               type: Schema.Types.ObjectId,
               ref: "customer",
               required: false,
               autopopulate: false,
          },

          idBusiness: {
               type: Schema.Types.ObjectId,
               ref: "business",
               required: false,
               autopopulate: false,
          },
          variables: { type: String },
          status: { type: String, enum: statuses, default: "sent" },
          observations: [{ type: String }],
          files: [{ type: String }],
     },
     { timestamps: { createdAt: true, updatedAt: true } }
);

SupportSchema.methods.toJSON = function () {
     const support = this.toObject();
     return support;
};

module.exports = mongoose.model("Support", SupportSchema);
