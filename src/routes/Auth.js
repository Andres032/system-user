const router = require ('express').Router();
const User = require ('../models/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken')
const axios = require('axios');
const mqtt = require ('mqtt');
var client = mqtt.connect('mqtt://mqtt.lyaelectronic.com');

const schemaRegister = Joi.object({
    username: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})
 
//El usuario si ya esta registrado puedo logiarse y hay recibira su token
router.post('/authorization', async (req, res) => {
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña inválida' })
    
    const token = jwt.sign({
        username: user.username,
        id: user._id,
        
    }, process.env.CONFIG_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token}
        

    })
 
 })

 //Eliminar usuario
router.delete('/:id', verifyToken, async (req, res, next) => {
    if(req.message == 0){
        res.status(400).send('Token invalido');
    } else {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ error: 'No existe el usuario' });
        await User.deleteOne({ _id: user._id });
        res.status(200).send('Usuario eliminado ');
    }
})


// Activacion
router.patch('/activar', verifyToken, async (req, res) => {
    jwt.verify(req.token, process.env.CONFIG_SECRET, (err, data) => {
        if (err) {
            res.json({
                message: 'Usuario activo'
            })
        } else {
            res.json({
                message: 'Hubo un problema',
                
            })
        }
    })

   

})



 //editar usuario

 router.put('/:id', verifyToken , async (req, res, next) =>{
    if(req.message == 0){
        res.status(400).send('Token invalido');
    } else {
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        let respuesta = await User.updateOne({_id: req.params.id}, req.body)
        res.status(200).send('Usuario modificado');
    }
})
 

// Registrar usuario
router.post('/signup', async (req, res) =>{
const {error} = schemaRegister.validate(req.body)


if (error) {
    return res.status(400).json(
        {error: error.details[0].message}
    )
}

const emailunico = await User.findOne({ email: req.body.email });
if (emailunico) {
    return res.status(400).json(
        {error: 'El usuario ya se  encuentra registrado'}
    )
}
const saltos = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, saltos);

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: password
    })

    try{
        const userDB = await user.save();
        res.json({
            error: null,
            data: userDB
        })

    }catch (error){
        res.status(400).json(error)
    }

    //Enviar mensaje al servidor MQTT
router.post('/messages/send', verifyToken, async (req, res, next) =>{
    async function Api(){
        let respuesta = await axios.get('https://catfact.ninja/fact?limit=1&max_length=120');
        return JSON.stringify(respuesta.data.fact)
    }
    const respuesta = await Api();

    const user = await User.findOne({email: req.body.email});
    if (!user){
        return res.status(404).json({ error: 'El correo no existe'})
    }
    const id = user._id

    let mensaje = res.json({id: id, frase: respuesta})

    function ConectarMensaje(){
        client.subscribe('lyatest/codigo_prueba', function (err){
            if (!err){
                client.publish('lyatest/codigo_prueba', mensaje)
            }
        })
    }
    client.on('connect', ConectarMensaje)
})

    

})

module.exports = router;