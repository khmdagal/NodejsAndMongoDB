const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config({ path: './config.env' });
const app = require('./app');


// Replacing password placeholder to the reall passowrd
const DB = process.env.REMOTE_DB.replace(
  '<PASSWORD>',
  process.env.REMOTE_DB_PASSWORD,
);
//const localDB = process.env.LOCAL_DB;
mongoose.connect(DB).then(() => console.log('DB successfully connected'));

app.listen(3000, () => {
  console.log(`server is running on port ${process.env.PORT}.....`);
});
