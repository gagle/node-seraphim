"use strict";

/*
Merging cli options with configurations files.

Undefined cli options.
*/

//Fake argv
process.argv = ["node", __filename, "--hostname", "a.b.c"];

var fs = require ("fs");
var seraphim = require ("../../lib");
var argv = require ("argp")
		.allowUndefinedArguments ()
		.allowUndefinedOptions ()
		.argv ();

seraphim.createVault ()
		.on ("error", function (error){
			console.error (error);
		})
		.on ("end", function (){
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
		.load ("web.json", function (o){
			//If you pass a callback, it returns the object that has been read, but it
			//is NOT merged with the vault object, you need to merge it explicitly
			
			if (argv.hostname) o.web.hostname = argv.hostname;
			if (argv.port) o.web.port = argv.port;
			
			this.merge (o);
		});