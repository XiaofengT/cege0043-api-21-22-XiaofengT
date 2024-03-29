var express = require('express');
var pg = require('pg');
var crud = require('express').Router();
var fs = require('fs');

var os = require('os');
 const userInfo = os.userInfo();
 const username = userInfo.username;
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
 
const bodyParser = require('body-parser');
crud.use(bodyParser.urlencoded({ extended: true })); 

// set up endpoints
crud.get('/getUserId', function (req, res) {
	pool.connect(function(err,client,done) {
		if(err){
			res.status(400).send(err);
		}
		var queryString = 'select user_id from ucfscde.users where user_name = current_user;';
		
		client.query(queryString, function (err, result) {
			done();
			if(err){
				res.status(400).send(err);
			}
			res.status(200).send(result.rows[0]);
		});
	});
});


crud.post('/insertAssetPoint', function(req, res) {
	pool.connect(function(err, client, done) {
		if(err){
			res.status(400).send(err);
		}
		
		var longitude = req.body.longitude;
		var latitude = req.body.latitude;
		var asset_name = req.body.asset_name;
		var installation_date = req.body.installation_date;
		
		var geometrystring = "st_geomfromtext('POINT("+req.body.longitude+ " "+req.body.latitude +")',4326)";
		var querystring = "INSERT into cege0043.asset_information (asset_name,installation_date, location) values ";
		querystring += "($1,$2,";
		querystring += geometrystring + ")";
		
		client.query(querystring, [asset_name, installation_date], function (err, result) {
			done();
			if(err){
				res.status(400).send(err);
			}
			res.json({message:req.body});
		});
	});
});


crud.post('/insertConditionInformation', function(req, res) {
	pool.connect(function(err, client, done) {
		if(err){
			res.status(400).send(err);
		}
		
		var asset_name = req.body.asset_name;
		var condition_description = req.body.condition_description;
		
		var querystring = "INSERT into cege0043.asset_condition_information (asset_id, condition_id) values (";
		querystring += "(select id from cege0043.asset_information where asset_name = $1),(select id from cege0043.asset_condition_options where condition_description = $2))";
		
		client.query(querystring, [asset_name, condition_description], function (err, result) {
			done();
			if(err){
				res.status(400).send(err);
			}
			res.json({message:req.body});
		});
	});
});


crud.post('/deleteAsset', (req, res) => {
	pool.connect(function(err, client, done) {
		if(err){
			res.status(400).send(err);
		}
		
		var id = req.body.id;
		
		var querystring = "DELETE from cege0043.asset_information where id = $1";
		
		client.query(querystring, [id], function (err, result) {
			done();
			if(err){
				res.status(400).send(err);
			}
			res.json({message:req.body});
		});
	});
});


crud.post('/deleteConditionReport', (req, res) => {
	pool.connect(function(err, client, done) {
		if(err){
			res.status(400).send(err);
		}
		
		var id = req.body.id;
		
		var querystring = "DELETE from cege0043.asset_condition_information where id = $1";
		
		client.query(querystring, [id], function (err, result) {
			done();
			if(err){
				res.status(400).send(err);
			}
			res.json({message:req.body});
		});
	});
});
 
 module.exports = crud;