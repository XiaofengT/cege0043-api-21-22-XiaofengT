var express = require('express');
var pg = require('pg');
var geoJSON = require('express').Router();
var fs = require('fs');

// get the username - this will ensure that we can use the same code on multiple machines
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

geoJSON.route('/testGeoJSON').get(function (req,res) {
	res.json({message:req.originalUrl});
});

geoJSON.get('/postgistest', function (req,res) {
pool.connect(function(err,client,done) {
	   if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   } 
	   client.query(' select * from information_schema.columns' ,function(err,result) {
		   done(); 
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});

geoJSON.get('/getSensors', function (req,res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
		var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
		querystring = querystring + "(SELECT 'Feature' As type , ST_AsGeoJSON(st_transform(lg.location,4326))::json As geometry, ";
		querystring = querystring + "row_to_json((SELECT l FROM (SELECT sensor_id, sensor_name, sensor_make, sensor_installation_date, room_id) As l)) As properties";
		querystring = querystring + " FROM ucfscde.temperature_sensors As lg limit 100 ) As f";
		client.query(querystring,function(err,result) {
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
	});
});

module.exports = geoJSON; 