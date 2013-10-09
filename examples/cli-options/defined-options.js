"use strict";

/*
Merging cli options with configurations files.

Defined cli options with default values. This example depends on the "argp"
module. With others cli parsers this example could change drastically.
*/

//Fake argv
process.argv = ["node", __filename, "--hostname", "a.b.c"];

var fs = require ("fs");
var seraphim = require ("../../lib");

//Read default values
seraphim.createVault ()
		.on ("error", function (error){
			console.error (error);
		})
		.on ("end", function (){
			//The cli options are read after the config files because they need a
			//default value
			var web = this.get ("web");
			
			var argv = require ("argp")
				.body ()
						.option ({
							long: "hostname",
							metavar: "HOST",
							default: web.hostname
						})
						.option ({
							long: "port",
							metavar: "PORT",
							default: web.port,
							type: Number
						})
				.argv ();
			
			console.log (argv);
			
			/*
			{
				hostname: "a.b.c",
				port: 1234
			}
			*/
			
			//Update the config object merging "argv" with "web"
			this.merge (web, argv);
			
			console.log (this.get ());
			
			/*
			{
				web: {
					hostname: "a.b.c",
					port: 1234,
					log: {
						type: "circular",
						backup: "1week"
					}
				}
			}
			*/
		})
		.load ("web.json");