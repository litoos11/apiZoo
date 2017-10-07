'use strict'

const express = require('express'),
			userController = require('../controllers/user'),
			mdAuth = require('../middlewares/authenticated'),
			multipart = require('connect-multiparty'),
			mdUpload = multipart({ uploadDir: './uploads/users'})

const api = express.Router();

api
	.get('/pruebas-controlador', mdAuth.ensureAuth, userController.pruebas)
	.post('/register', userController.saveUser)
	.post('/login', userController.login)
	.put('/update-user/:id', mdAuth.ensureAuth, userController.updateUser)
	.post('/upload-image/:id',[ mdAuth.ensureAuth, mdUpload], userController.uploadImage)

module.exports = api;