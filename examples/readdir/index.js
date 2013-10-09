"use strict";

/*
Loads all the well-known configuration files inside a directory and ignores the
rest.
*/

var fs = require ("fs");
var properties = require ("properties");
var seraphim = require ("../../lib");

var loadConfigFiles = function (dir, cb){
	fs.readdir (".", function (error, entries){
		if (error) return console.error (error);
		
		var propertiesOptions = {
			path: true,
			namespaces: true
		};
		
		//If "extensionError" is false, unknown extensions don't emit an error
		var vault = seraphim.createVault ({ extensionError: false });
		
		vault
				.on ("error", function (error){
					cb (error);
				})
				.on ("end", function (){
					cb (this.get ());
				})
				.extension (".properties", function (p, cb){
					properties.parse (p, propertiesOptions, cb);
				});
		
		entries.forEach (function (entry){
			//load() simply enqueues an asynchronous task in the current loop tick,
			//they are executed in subsequent ticks
			vault.load (entry);
		});
	});
};

loadConfigFiles (".", function (error, config){
	if (error) return console.error (error);
	
	console.log (config);
	
	/*
	{
		database: {
			hostname: "1.2.3.4",
			port: 1234
		},
		web: {
			hostname: "4.3.2.1",
			port: 4321
		}
	}
	*/
});