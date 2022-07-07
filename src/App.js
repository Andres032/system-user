const express = require('express');
require('dotenv').config();
require('./database/connection')

// capture data body
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('welcome docs');
});

const verifyToken = require('./middleware/verifyToken')
const perfil = require('./routes/Perfil')


// route middlewares
app.use('/user', authRoutes);
app.use('/user/perfil', verifyToken, perfil)

// Server
app.listen(process.env.PORT, () => {
    console.log(`Server running success:${process.env.PORT}`)
});