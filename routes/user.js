'use strict'

const express = require('express'),
			api = express.Router(),
			userController = require('../controllers/user'),
			mdAuth = require('../middlewares/authenticated'),
			multipart = require('connect-multiparty'),
			mdUpload = multipart({ uploadDir: './uploads/users'})


api
	.get('/pruebas-controlador', mdAuth.ensureAuth, userController.pruebas)
	.get('/get-image-user/:imageFile', userController.getImageFile)
	.get('/keepers/', userController.getKeepers)
	.post('/register', userController.saveUser)
	.post('/login', userController.login)
	.post('/upload-image-user/:id',[ mdAuth.ensureAuth, mdUpload], userController.uploadImage)
	.put('/update-user/:id', mdAuth.ensureAuth, userController.updateUser)

module.exports = api;