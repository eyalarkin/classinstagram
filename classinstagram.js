const http = require('http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const dbName  = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_DB_COLLECTION;
