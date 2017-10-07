'use strict'

const mongoose = require('mongoose'),
			app = require('./app'),
			port = process.env.PORT || 3001;

mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://localhost:27017/zoo', { useMongoClient: true }, (err, res) => {
// 	if(err){
// 		throw err
// 	}else{
// 		console.log(`La conexión a la base de datos zoo se ha realizado...`)
// 	}
// });
mongoose.connect('mongodb://localhost:27017/zoo', { useMongoClient: true })
	.then(() => {
		console.log(`La conexión a la base de datos zoo se ha realizado...`);

		app.listen(port, () => {
			console.log(`El servidor local con Node y express esat corriendo...`);
		});
	})
	.catch(err => console.log(err));