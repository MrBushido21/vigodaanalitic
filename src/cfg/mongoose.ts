// getting-started.js
import mongoose from 'mongoose';
import "dotenv/config";

const pass = process.env.MONGOPASS
export async function mongo() {
  
  await mongoose.connect(`mongodb+srv://oleglis:${pass}@shopingkarocluster.qsarwpr.mongodb.net/?appName=ShopingKaroCluster`);

  console.log("✅ MongoDB подключен успешно")
}