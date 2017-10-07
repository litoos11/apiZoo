'use strict'

const express = require('express'),
			bodyParser = require('body-parser'),
			app = express();

// cargar rutas
const user_routes = require('./routes/user');

// middlewares de body-parser
app
	.use(bodyParser.urlencoded({extended: false}))
	.use(bodyParser.json())

// Configurar cabeceras y cors

//rutas base
app
	.use('/api', user_routes);

module.exports = app;