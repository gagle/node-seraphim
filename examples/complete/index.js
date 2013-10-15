"use strict";

/*
Complete example with: multiple environments (production, development), cli
options and multiple config files. This is the most common scenario.

The "argp" module is used to parse the cli options.
*/

//Fake environment vars
process.env.NODE_ENV = "development";
process.env.DATABASE_HOSTNAME = "10.0.0.1";
process.env.DATABASE_PORT = "1337";

//Fake argv
process.argv = ["node", __filename, "--db-port", "1338"];

//Configure CLI options
//The "argp" module prints a nice help message. Modify the previous fake argv
//and add the "-h" option to see it in action
var argv = require ("argp")
		.body ()
				.option ({
					long: "db-hostname",
					metavar: "HOST"
				})
				.option ({
					long: "db-port",
					metavar: "PORT",
					type: Number
				})
				.help ()
		.argv ();

var seraphim = require ("../../lib");

var loadConfig = function (argv, cb){
	var envConfigFile;
	if (process.env.NODE_ENV === "production"){
		envConfigFile = "production.json";
	}else{
		envConfigFile = "development.json";
	}

	seraphim.createVault ()
			.on ("error", cb)
			.on ("end", function (){
				cb (null, this.get ());
			})
			//Common config file
			.load ("config1.json")
			//Common config file
			.load ("config2.json")
			//Environment specific file
			.load (envConfigFile)
			//Environment vars
			.load (function (){
				var o = this.get ();
				if (process.env.DATABASE_HOSTNAME){
					o.database.hostname = process.env.DATABASE_HOSTNAME;
				}
				if (process.env.DATABASE_PORT){
					o.database.port = parseInt (process.env.DATABASE_PORT);
				}
			})
			//CLI options
			.load (function (){
				var o = this.get ();
				if (argv["db-hostname"]) o.database.hostname = argv["db-hostname"];
				if (argv["db-port"]) o.database.port = argv["db-port"];
			})
};

loadConfig (argv, function (error, config){
	if (error) return console.error (error);
	
	argv = null;
	console.log (config);
	
	/*
	{
		log: {
			type: "circular",
			backup: "1week"
		},
		database: {
			hostname: "10.0.0.1",
			port: 1338
		},
		web: {
			hostname: "4.3.2.1",
			port: 4321
		}
	}
	*/
});