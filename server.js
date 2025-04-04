const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', err => {
  console.log('UNHANDLED Execption');
  console.log(err);
    procces.exit(1);
})

mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port: ${port}, ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});


