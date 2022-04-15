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


geoJSON.get('/assetsInGreatCondition', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var querystring = "select array_to_json (array_agg(d)) from ";
	   querystring += "(select c.* from cege0043.asset_information c inner join ";
	   querystring += "(select count(*) as best_condition, asset_id from cege0043.asset_condition_information where ";
	   querystring += "condition_id in (select id from cege0043.asset_condition_options where condition_description like '%very good%') ";
	   querystring += "group by asset_id ";
	   querystring += "order by best_condition desc) b ";
	   querystring += "on b.asset_id = c.id) d;";
	   
	   client.query(querystring, function(err,result){
		   done();
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});


geoJSON.get('/dailyParticipationRates', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var querystring = "select array_to_json (array_agg(c)) from ";
	   querystring += "(select day, sum(reports_submitted) as reports_submitted, sum(not_working) as reports_not_working ";
	   querystring += "from cege0043.report_summary ";
	   querystring += "group by day) c ";
	   
	   client.query(querystring, function(err,result){
		   done();
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});


geoJSON.get('/assetsAddedWithinLastWeek', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
	   querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
	   querystring += "row_to_json((SELECT l FROM (SELECT id, asset_name, installation_date) As l )) As properties ";
	   querystring += "FROM cege0043.asset_information  As lg";
	   querystring += " where timestamp > NOW()::DATE-EXTRACT(DOW FROM NOW())::INTEGER-7  limit 100  ) As f ";
	   
	   client.query(querystring, function(err,result){
		   done();
		   if(err){
			   console.log(err);
			   res.status(400).send(err);
		   }
		   res.status(200).send(result.rows);
	   });
	});
});


geoJSON.get('/fiveClosestAssets/:latitude/:longitude', function (req,res) {
	pool.connect(function(err, client, done) {
		if(err){
		   console.log("not able to get connection "+ err);
		   res.status(400).send(err);
	   }
	   
	   var longitude = req.params.longitude;
	   var latitude = req.params.latitude;
	   
	   var querystring = "SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features  FROM ";
	   querystring += "(SELECT 'Feature' As type     , ST_AsGeoJSON(lg.location)::json As geometry, ";
	   querystring += "row_to_json((SELECT l FROM (SELECT id, asset_name, installation_date) As l  )) As properties";
	   querystring += " FROM   (select c.* from cege0043.asset_information c ";
	   querystring += "inner join (select id, st_distance(a.location, st_geomfromtext('POINT("+longitude+" "+latitude+ ")',4326)) as distance ";
	   querystring += "from cege0043.asset_information a ";
	   querystring += "order by distance asc ";
	   querystring += "limit 5) b ";
	   querystring += "on c.id = b.id ) as lg) As f";
	   
	   client.query(querystring, function(err,result){
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