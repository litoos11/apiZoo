'use strict'

const jwt = require('jwt-simple'),
			moment = require('moment'),
			secret = 'clave_secreta_de_prueba'

exports.ensureAuth = function(req, res, next){
	if(!req.headers.authorization){
		return res.status(404).send({message: 'No existe la cabecera de authorization'})
	}else{
		var token = req.headers.authorization.replace(/['"]+/g, '')

		try{
			var payload = jwt.decode(token, secret)
			if((payload.exp <= moment().unix())){
				return res.status(401).send({message: 'El token ha expirado'})
			}
		}catch(ex){
			return res.status(404).send({message: 'El token no es válido'})
		}
	}

	req.user = payload;

	next()
}