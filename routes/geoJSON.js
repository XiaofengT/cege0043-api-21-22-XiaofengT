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


geoJSON.get('/geoJSONUserId/:user_id', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   } 
	   
		var user_id = req.params.user_id;
		var colnames = "asset_id, asset_name, installation_date, latest_condition_report_date, condition_description";

		var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
		querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
		querystring += "row_to_json((SELECT l FROM (SELECT "+colnames + " ) As l      )) As properties";
		querystring += "   FROM cege0043.asset_with_latest_condition As lg ";
		querystring += " where user_id = $1 limit 100  ) As f ";
	   client.query(querystring, [user_id], function(err, result){
		   done();
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});


geoJSON.get('/userConditionReports/:user_id', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var user_id = req.params.user_id;
	   
	   var querystring = "select array_to_json (array_agg(c)) from";
	   querystring += "(SELECT COUNT(*) AS num_reports from cege0043.asset_condition_information where user_id = $1) c;"
	   
	   client.query(querystring, [user_id], function(err,result){
		   done();
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});


geoJSON.get('/userRanking/:user_id', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var user_id = req.params.user_id;
	   
	   var querystring = "select array_to_json (array_agg(hh)) from";
	   querystring += "(select c.rank from (SELECT b.user_id, rank()over (order by num_reports desc) as rank ";
	   querystring += "from (select COUNT(*) AS num_reports, user_id ";
	   querystring += "from cege0043.asset_condition_information ";
	   querystring += "group by user_id) b) c ";
	   querystring += "where c.user_id = $1) hh ";
	   
	   client.query(querystring, [user_id], function(err,result){
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