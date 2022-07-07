const mongoose = require('mongoose');

const url = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.8ax3v.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const option = {useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(url, option)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))