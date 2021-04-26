import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import * as dotenv from 'dotenv';
import initRoutes from "./src/routes";
import { errorHandler } from "./src/errorHandler";

dotenv.config();
const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    //console.log(req.body);
    next();
});

app.get("/", async (req: express.Request, res: express.Response) => {
    try {
        res.status(200).send("Hello World");
    } catch (e) {
        console.log(e);
    }
});

initRoutes(app);
app.use(errorHandler);

if (process.env.NODE_ENV == 'development') {
    app.listen(port, '0.0.0.0', () => {
        console.log(`App listening at http://localhost:${port}`);
    });
} else {
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
}
