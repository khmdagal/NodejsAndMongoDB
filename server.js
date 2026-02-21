const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');


// Replacing password placeholder with the real password
const DB = process.env.LOCAL_DB;
// REMOTE_DB.replace(
//   '<PASSWORD>',
//   process.env.REMOTE_DB_PASSWORD,
// );
//const localDB = process.env.LOCAL_DB;
mongoose.connect(DB).then(() => console.log('DB successfully connected'));

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}.....`);
});
