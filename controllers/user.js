'use strict'
// Modulos
const bcrypt = require('bcrypt-nodejs'),
	    User = require('../models/user'),
	    jwt = require('../services/jwt'),
	    fs = require('fs'),
	    path = require('path');

// Acciones
function pruebas(req, res){
	res.status(200).send({
		message: 'Probando el controlador de usuario y accion pruebas',
		user: req.user
	})
}

function saveUser(req, res) {
	let user = new User(),
			params = req.body

	if(params.password && params.name && params.surname && params.email){
			
			user.name = params.name
			user.surname = params.surname
			user.email = params.email
			user.role =  params.role
			user.image = null	

		let promise = new Promise((resolve, reject) => {
			User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
				if(err){
					reject(new Error('Error al comprobar el usuario'))
				}else{
					(!issetUser) ? resolve(true) : reject(new Error('El usuario ya existe'))
				}
			})
		})

		promise
			.then((dataPromise) => {
				bcrypt.hash(params.password, null, null, (err, hash) => {
					user.password = hash

					user.save((err, userStored) => {
						if(err){
							res.status(500).send({message: 'Error al guardar el usuario'})
						}else{
							(!userStored) 
								? res.status(404).send({message: 'No se ha registrado el usuario'})
								: res.status(200).send({userStored})							
						}
					})
				})
			})
			.catch((err)=>{
				res.status(200).send({ message: err.message })
				// console.log(err.message)
			})
	}else{
		res.status(200).send({ message: 'Introduce los datos correctos para el usuario...'	})
	}
}

function login(req, res) {
	let params = req.body,
			email = params.email,
			password = params.password

	let promise = new Promise((resolve, reject) => {
		User.findOne({email: email.toLowerCase()}, (err, user) => {
			if(err){
				reject(new Error('Error al comprobar el usuario'))
			}else{
				(!user) ? reject(new Error('El usuario no existe')) : resolve(user)				
			}
		})
	})

	promise
		.then((dataPromise) => {
			bcrypt.compare(password, dataPromise.password, (err, check) => {
				if(check){
					(params.gettoken) 
						? res.status(200).send({token: jwt.createToken(dataPromise)})
						: res.status(200).send({user: dataPromise})					
				}else{
					res.status(404).send({message: 'Error al iniciar sesión :-('})
				}
			})
		})
		.catch((err) => {
			res.status(200).send({ message: err.message })
			// console.log(err.message)
		})
}

function updateUser(req, res) {
	let userId = req.params.id,
			update = req.body
			delete update.password;

	if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes permisor para actualizar el usuario'})
	}else{
		User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpadate) => {
			if(err){
				res.status(500).send({message: 'Error al actualizar el usuario'})
			}else{
				(!userUpadate)
					? res.status(404).send({message: 'No se ha podido actualizar el usuario'})
					: res.status(200).send({user: userUpadate})			
			}
		})
	}
}

function uploadImage(req, res) {
	let userId = req.params.id,
			fileName = 'No subido...'

	if(req.files){
		let filePath = req.files.image.path,
				fileSplit = filePath.split('/'),
				fileName = fileSplit[2],
				extSplit = fileName.split('.'),
				fileExt = extSplit[1]

		if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){
				if(userId != req.user.sub){
					return res.status(500).send({message: 'No tienes permisor para actualizar el usuario'})
				}else{
					User.findByIdAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpadate) => {
						if(err){
							res.status(500).send({message: 'Error al actualizar el usuario'})
						}else{
							(!userUpadate)
								? res.status(404).send({message: 'No se ha podido actualizar el usuario'})
								: res.status(200).send({user: userUpadate, image: fileName})					
						}
					})
				}
		}else{
			fs.unlink(filePath, (err) => {
				(err)
					? res.status(200).send({ message: 'Extensión no Válida y fichero no borrado' })
					: res.status(200).send({ message: 'Extensión no Válida' })				
			})
		}
		
	}else{
		res.status(200).send({ message: 'No se ha subido imagen' })
	}
}

function getImageFile(req, res){
	let imageFile = req.params.imageFile,
			pathFile = `./uploads/users/${imageFile}`;

			// console.log(pathFile)
	fs.exists(pathFile, (exists) => {
		(exists) ? res.sendFile(path.resolve(pathFile)) : res.status(404).send({message: 'La imagen no existe'})
	})
}

function getKeepers(req, res){
	User.find({role: 'ROLE_ADMIN'}).exec((err, users) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			(!users) ? res.status(404).send({message: 'No hay cuidadores'}) : res.status(200).send({ users})
		}
	})
}

module.exports = {
	pruebas,
	saveUser,
	login,
	updateUser,
	uploadImage,
	getImageFile,
	getKeepers
}

