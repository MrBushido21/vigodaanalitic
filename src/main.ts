import express from 'express';
import { mongo } from './cfg/mongoose';
import dotenv from "dotenv";
import "./cfg/mongoose";
import { Kitten } from "./db/schema";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000
app.use(express.json());


async function start() {
    await mongo().catch(err => console.log(err));

    app.listen(PORT, () => {
        console.log('hello world');
    })
}

start()
export default app;