const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const Tour = require('./../../models/tourModel');

// Replacing password placeholder to the reall passowrd
const DB = process.env.REMOTE_DB.replace(
  '<PASSWORD>',
  process.env.REMOTE_DB_PASSWORD,
);

console.log(DB)
//const localDB = process.env.LOCAL_DB;
mongoose.connect(DB).then(() => console.log('DB successfully connected'));

// reading json file while converting JSON javascript object

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// IMPORT TOURS DATA INTO DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data imported successfully');
  } catch (error) {
    console.log(error);
  }
};

const deleteExitingData = async () => {
  try {
    await Tour.deleteMany();
  } catch (error) {
    console.log(error);
  }
};

console.log('==>>', process.argv);
