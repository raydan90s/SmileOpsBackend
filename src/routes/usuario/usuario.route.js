// src/routes/usuario/usuario.route.js
const express = require('express');
const router = express.Router();
const { loginUsuario, tokenUsuario } = require('@controllers/usuario/usuario.controller');
 

router.post('/', loginUsuario);
router.get('/token', tokenUsuario);

module.exports = router;
