var express = require('express');
var pg = require('pg');
var crud = require('express').Router();
var fs = require('fs');


var os = require('os');
 const userInfo = os.userInfo();
 const username = userInfo.username;
 console.log(username);
 // locate the database login details
 var configtext = ""+fs.readFileSync("/home/"+username+"/certs/postGISConnection.js");
 
 // now convert the configruation file into the correct format -i.e. a name/value pair array
 var configarray = configtext.split(",");
 var config = {};
 for (var i = 0; i < configarray.length; i++) {
	 var split = configarray[i].split(':');
	 config[split[0].trim()] = split[1].trim();
 }
 var pool = new pg.Pool(config);
 console.log(config); 
 
const bodyParser = require('body-parser');
crud.use(bodyParser.urlencoded({ extended: true })); 

var userID;
crud.get('/getUserId', function (req, res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
		var queryString = 'select user_id from ucfscde.users where user_name = current_user;';
		
		client.query(queryString, function (err, result) {
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows[0]);
			var user_id = JSON.stringify(result.rows[0]);
			user_id = user_id.substring(11, user_id.length - 1);
			userID = Number(user_id);
			console.log(userID);
		});
		res.json({message:req.originalUrl+" " +"GET REQUEST"});
	});
});

 
 module.exports = crud;