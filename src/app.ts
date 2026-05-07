import express, { type Application } from "express";
import { diagnoseRouter } from "./routes/diagnose.route.js";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/diagnose", diagnoseRouter);

export default app;
