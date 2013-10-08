"use strict";

var seraphim = require ("./lib");
var properties = require ("properties");
var argv = require ("argp")
		.allowUndefinedArguments ()
		.allowUndefinedOptions ()
		.body ().help ()
		.argv ();

var optionsProperties = {
	path: true,
	namespaces: true
};
		
var vault = seraphim.createVault ();
vault.extension (".properties", function (p, cb){
	properties.parse (p, optionsProperties, cb)
});

vault.on ("error", function (error){
	console.log (error);
});

vault.on ("end", function (){
	console.log (this.get ());
});
		
vault
		.use ({ a: { b: 1 } })
		.use (function (cb){
			process.nextTick (function (){
				cb (null, { a: { b: 2 } });
			});
		})
		.use (function (){
			return { a: { b: 3 } };
		})
		.use ("a.json")
		.use ("b.properties")
		.use (function (){
			var a = vault.get ("a");
			a.b = argv.b !== undefined ? argv.b : a.b;
			a.c = argv.c !== undefined ? argv.c : a.c;
		});

/*
$ node t.js
{ a: { b: 3, c: 2 } }

node t.js --b 0 --c 3
{ a: { b: 0, c: 3 } }

$ node t.js -h
Usage: t [options]

	-h, --help                  Display this help message and exit
*/