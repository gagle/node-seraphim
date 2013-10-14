"use strict";

var fs = require ("fs");
var seraphim = require ("../../lib");
var properties = require ("properties");

seraphim.createVault ()
		.on ("error", function (error){
			console.error (error);
		})
		.on ("end", function (){
			console.log (this.get ());
			
			/*
				{ a: 1, b: 2 }
			*/
		})
		.extension ("", function (p, cb){
			//Simply load the file, it will be parsed later
			fs.readFile (p, { encoding: "utf8" }, cb);
		})
		.load ("file1", function (data, cb){
			//file1 has .json data
			//The "cb" parameter must be used to return the error/result because
			//the onLoad callback doesn't catch error, we must catch them with
			//try-catch
			try{
				this.merge (JSON.parse (data));
				cb ();
			}catch (error){
				cb (error);
			}
		})
		.load ("file2", function (data){
			//file2 has .properties data
			this.merge (properties.parse (data));
		})