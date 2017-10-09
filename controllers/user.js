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
			user.role = 'ROLE_ADMIN'
			user.image = null	

		let promise = new Promise((resolve, reject) => {
			User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
				if(err){
					reject(new Error('Error al comprobar el usuario'))
				}else{
					if(!issetUser){
						resolve(true)
					}else{
						reject(new Error('El usuario ya existe'))
					}
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
							if(!userStored){
								res.status(404).send({message: 'No se ha registrado el usuario'})
							}else{
								res.status(200).send({userStored});
							}
						}
					})
				})
			})
			.catch((err)=>{
				res.status(200).send({ message: err.message })
				console.log(err.message)
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
				if(!user){
					reject(new Error('El no existe'))
				}else{
					resolve(user)
				}
			}
		})
	})

	promise
		.then((dataPromise) => {
			bcrypt.compare(password, dataPromise.password, (err, check) => {
				if(check){
					if(params.gettoken){
						res.status(200).send({token: jwt.createToken(dataPromise)})
					}else{
						res.status(200).send(dataPromise)
					}
				}else{
					res.status(404).send({message: 'Error al iniciar sesión :-('})
				}
			})
		})
		.catch((err) => {
			res.status(200).send({ message: err.message })
			console.log(err.message)
		})

	// res.status(200).send({message: 'Metodo login...'})
}

function updateUser(req, res) {
	let userId = req.params.id,
			update = req.body

	if(userId != req.user.sub){
		return res.status(500).send({message: 'No tienes permisor para actualizar el usuario'})
	}else{
		User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpadate) => {
			if(err){
				res.status(500).send({message: 'Error al actualizar el usuario'})
			}else{
				if(!userUpadate){
					res.status(404).send({message: 'No se ha podido actualizar el usuario'})
				}else{
					res.status(200).send({userUpadate})
				}
			}
		})
	}

	// res.status(200).send({ message: 'Actualizar usuario' })
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
							if(!userUpadate){
								res.status(404).send({message: 'No se ha podido actualizar el usuario'})
							}else{
								res.status(200).send({user: userUpadate, image: fileName})
							}
						}
					})
				}
		}else{
			fs.unlink(filePath, (err) => {
				if(err){
					res.status(200).send({ message: 'Extensión no Válida y fichero no borrado' })
				}else{
					res.status(200).send({ message: 'Extensión no Válida' })
				}
			})
		}
		
	}else{
		res.status(200).send({ message: 'No se ha subido imagen' })
	}

	// res.status(200).send({ message: 'Subir imagen' })
}

function getImageFile(req, res){
	let imageFile = req.params.imageFile,
			pathFile = `./uploads/users/${imageFile}`;

			console.log(pathFile)
	fs.exists(pathFile, (exists) => {
		if(exists){
			res.sendFile(path.resolve(pathFile))
		}else{
			res.status(404).send({message: 'La imagen no existe'})
		}

		// (exists) ? res.sendFile(path.resolve(pathFile)) : res.status(404).send({message: 'La imagen no existe'});
	})
	// res.status(200).send({message: 'Get imagen file'})
}

function getKeepers(req, res){
	User.find({role: 'ROLE_ADMIN'}).exec((err, users) => {
		if(err){
			res.status(500).send({message: 'Error en la petición'})
		}else{
			if(!users){
				res.status(404).send({message: 'No hay cuidadores'})
			}else{
				res.status(200).send({users})
			}
		}
	})
	// res.status(200).send({message: 'Get keepers'})

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

// function saveUser(req, res){
// 	var user = new User(),
// 			params = req.body


// 	if(params.password && params.name && params.surname && params.email){
// 		user.name = params.name
// 		user.surname = params.surname
// 		user.email = params.email
// 		user.role = 'ROLE_ADMIN'
// 		user.image = null	

// 		User.findOne({email: user.email.toLowerCase()}, (err, issetUser) => {
// 			if(err){
// 				res.status(500).send({message: 'Error al comprobar el usuario'})
// 			}else{
// 				if(!issetUser){
// 					bcrypt.hash(params.password, null, null, (err, hash) => {
// 						user.password = hash

// 						user.save((err, userStored) => {
// 							if(err){
// 								res.status(500).send({message: 'Error al guardar el usuario'})
// 							}else{
// 								if(!userStored){
// 									res.status(404).send({message: 'No se ha registrado el usuario'})
// 								}else{
// 									res.status(200).send({userStored});
// 								}
// 							}
// 						})
// 					})
// 				}else{
// 					res.status(200).send({ message: 'El usuario ya existe'	})
// 				}
// 			}
// 		})
// 	}else{
// 		res.status(200).send({ message: 'Introduce los datos correctamente para registar el usuario...'	})
// 	}			
// }