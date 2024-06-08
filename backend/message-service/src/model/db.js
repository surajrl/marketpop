import mongoose from "mongoose";

const mongoUrl =
  process?.env?.MONGO_URL ||
  "mongodb+srv://nbhandari1:Hello@chat.lrbggsa.mongodb.net/dev?retryWrites=true&w=majority";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`Connected to MongoDB at ${mongoUrl}...`))
  .catch((err) => console.error("Could not connect to MongoDB...", err));
