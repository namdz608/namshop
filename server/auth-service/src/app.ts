import express, { Express } from "express";
import { start } from './server'
import { databaseConnection } from './database'
import cloudinary from 'cloudinary';
require('dotenv').config();

function cloudinaryConfig(): void {
    cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    });
}

const initialize = (): void => {
    cloudinaryConfig()
    const app: Express = express()
    databaseConnection()
    start(app)
}

initialize()