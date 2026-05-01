import express from 'express';
import { mongo } from './cfg/mongoose';
import dotenv from "dotenv";
import postrouter from './routes/post.routes';
import getrouter from './routes/get.routes';
import './cron/stats.cron'

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000

app.use(express.json());
app.use(postrouter);
app.use(getrouter);

async function start() {
    await mongo();
    app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));
}

start()
export default app;