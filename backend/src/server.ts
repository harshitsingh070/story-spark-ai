import mongoose from "mongoose";
import config from "./config";
import app from "./app";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);


async function main() {
  try {
    const url = config.database_url;
    console.log(url);
    await mongoose.connect(config.database_url as string);
    app.listen(config.port, () => {
      console.log(`Story-Spark-AI app listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

main();
