'use strict'

const User = require('../models/user'),
			Animal = require('../models/animal'),
	    fs = require('fs'),
	    path = require('path')

function pruebas(req, res){
	res.status(200).send({
		message: 'Probando el controlador de usuario y accion pruebas',
		user: req.user
	})
}

function saveAnimal(req, res){
	// console.log(req.body)
	let animal = new Animal(),
			params = req.body


	if(params.name){
		animal.name = params.name
		animal.description = params.description
		animal.year = params.year
		animal.image = null
		animal.user = req.user.sub

		animal.save((err, animalStored) => {
			if(err){
				res.status(500).send({message: 'Error en el servidor'})
			}else{
				(!animalStored) 
					?	res.status(404).send({message: 'No se ha guardado el animal'}) 
					: res.status(200).send({animal: animalStored})				
			}
		})		
	}else{
		res.status(404).send({message: 'El nombre del animal es obligatorio'})
	}
}

function getAnimals(req, res){
	Animal.find({}).populate({path: 'user'}).exec((err, animals) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			(!animals) 
				? res.status(404).send({message: 'No hay animales'}) 
				: res.status(200).send({animals})
		}
	})
}

function getAnimal(req, res){
	let animalId = req.params.id

	Animal.findById(animalId).populate({path: 'user'}).exec((err, animal) => {
		// console.log(animal)
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			(!animal) 
				? res.status(404).send({message: 'No existe el animale'}) 
				: res.status(200).send({animal})
		}
	})
}

function updateAnimal(req, res){
	let animalId = req.params.id,
			update = req.body
			// console.log(update)

	Animal.findByIdAndUpdate(animalId, update, {new: true}).exec((err, animalUpdate) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			(!animalUpdate)
				? res.status(404).send({message: 'No se actualizo el animal'})
				: res.status(200).send({animal: animalUpdate})
		}
	})
}

function uploadImage(req, res) {
	let animalId = req.params.id,
			fileName = 'No subido...'
	if(req.files){
		let filePath = req.files.image.path,
				fileSplit = filePath.split('/'),
				fileName = fileSplit[2],
				extSplit = fileName.split('.'),
				fileExt = extSplit[1]

		if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
				// if(userId != req.user.sub){
				// 	return res.status(500).send({message: 'No tienes permisor para actualizar el usuario'})
				// }else{
					Animal.findByIdAndUpdate(animalId, {image: fileName}, {new: true}, (err, animalUpdate) => {
						if(err){
							res.status(500).send({message: 'Error al actualizar el usuario'})
						}else{
							(!animalUpdate) 
								?	res.status(404).send({message: 'No se ha podido actualizar el animal'})
								:	res.status(200).send({animal: animalUpdate, image: fileName})
						}
					})
				// }
		}else{
			fs.unlink(filePath, (err) => {
				(err)
					?	res.status(200).send({ message: 'Extensión no Válida y fichero no borrado' })
					: res.status(200).send({ message: 'Extensión no Válida' })
			})
		}		
	}else{
		res.status(200).send({ message: 'No se ha subido imagen' })
	}
}

function getImageFile(req, res){
	let imageFile = req.params.imageFile,
			pathFile = `./uploads/animals/${imageFile}`;

			// console.log(pathFile)
	fs.exists(pathFile, (exists) => {
		(exists) 
			? res.sendFile(path.resolve(pathFile)) 
			: res.status(404).send({message: 'La imagen no existe'})
	})
}

function deleteAnimal(req, res){
	let animalId = req.params.id

	Animal.findByIdAndRemove(animalId).exec((err, animalRemoved) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			(!animalRemoved)
				? res.status(404).send({message: 'No se ha borrado el animal'})
				: res.status(200).send({animal: animalRemoved})
		}
	})
}


module.exports = {
	pruebas,
	saveAnimal,
	getAnimals,
	getAnimal,
	updateAnimal,
	uploadImage,
	getImageFile,
	deleteAnimal
}