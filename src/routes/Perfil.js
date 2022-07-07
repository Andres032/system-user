const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({
        error: null,
        data: {
            title: 'Informacion de mi perfil',
            user: req.user,
            
        }
    })
})
 module.exports = router