const mongoose = require("mongoose");

const container = require("./src/startup/container");
const server = container.resolve("app");
const { MONGO_URI } = container.resolve("config");

console.log(MONGO_URI);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(async () => {
    server.start();
  })
  .catch(console.log);
