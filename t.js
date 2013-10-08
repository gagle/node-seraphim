"use strict";

var seraphim = require ("./lib");

var argv = require ("argp")
		.allowUndefinedArguments ()
		.allowUndefinedOptions ()
		.body ().help ()
		.argv ();

var vault = seraphim.createVault ();

vault.on ("error", function (error){
	console.log (error);
});

vault.on ("end", function (){
	console.log ("end");
	console.log (this.get())
});
/*
vault
		.use ({ x: 100 })
		.use ("b.json")
		.use ("a.json")
		.use (function (){
			if (argv.b){
				vault.merge ({
					a: {
						b: argv.b
					}
				});
			}
		});*/
		
vault
		.use (function (){
			return 2
		}, console.log)
		.use ({ a: { b: "hola" } })
		.use (function (){
			var a = vault.get ("a");
			a.b = argv.b ? argv.b : a.b;
		})