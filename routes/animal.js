'use strict'

const express = require('express'),
			api = express.Router(),
			animalController = require('../controllers/animal'),
			mdAuth = require('../middlewares/authenticated'),
			mdAdmin = require('../middlewares/is-admin'),
			multipart = require('connect-multiparty'),
			mdUpload = multipart({ uploadDir: './uploads/animals'})


api
	.get('/pruebas-animales', mdAuth.ensureAuth, animalController.pruebas)
	.get('/animals', animalController.getAnimals)
	.get('/animal/:id', animalController.getAnimal)
	.get('/get-image-animal/:imageFile', animalController.getImageFile)
	.post('/animal', [mdAuth.ensureAuth, mdAdmin.isAdmin], animalController.saveAnimal)
	.put('/animal/:id', [mdAuth.ensureAuth, mdAdmin.isAdmin], animalController.updateAnimal)
	.post('/upload-image-animal/:id', [mdAuth.ensureAuth, mdAdmin.isAdmin, mdUpload], animalController.uploadImage)
	.delete('/animal/:id', [mdAuth.ensureAuth, mdAdmin.isAdmin], animalController.deleteAnimal)

module.exports = api;