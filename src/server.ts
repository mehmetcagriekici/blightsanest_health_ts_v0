import app from "./app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log(`server running at http://localhost:${config.port}`);
})
