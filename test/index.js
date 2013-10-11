"use strict";

var seraphim = require ("../lib");
var assert = require ("assert");
var properties = require ("properties");

var tests = {
	"basic usage": function (done){
		var propertiesOptions = {
			path: true,
			namespaces: true
		};
				
		var vault = seraphim.createVault ();

		vault.extension (".properties", function (p, cb){
			properties.parse (p, propertiesOptions, cb);
		});

		vault.on ("error", function (error){
			assert.ifError (error);
		});

		vault.on ("end", function (){
			assert.deepEqual (this.get (), {
				a: {
					b: 5,
					c: 2
				},
				x: 1,
				y: 1,
				z: 1
			});
			done ();
		});
				
		vault
				//Object
				.load ({ a: { b: 1 } })
				//Asynchronous function
				.load (function (cb){
					process.nextTick (function (){
						cb (null, { a: { b: 2 }, x: 1 });
					});
				})
				//Synchronous function
				.load (function (){
					return { a: { b: 3 }, y: 1 };
				})
				//Fake asynchronous function (synchronous)
				.load (function (cb){
					cb (null, { a: { b: 4 }, z: 1 });
				})
				//Asynchronous function inside the onLoad callback
				.load ({ a: { b: 5 }}, function (o, cb){
					assert.deepEqual (o, {
						a: {
							b: 5
						}
					});
					
					this.merge (o);
					process.nextTick (cb);
				})
				//json file
				.load ("a.json", function (o){
					assert.deepEqual (o, {
						a: {
							c: 1
						}
					});
				})
				//Custom extension
				.load ("b.properties");
	},
	"multiple end events": function (done){
		var vault = seraphim.createVault ();
		
		vault.on ("error", function (error){
			assert.ifError (error);
		});

		vault.on ("end", function (){
			if (i++ === 3){
				assert.deepEqual (this.get (), {
					a: 3
				});
				done ();
				return;
			};
			
			process.nextTick (function (){
				vault.load ({ a: i });
			});
		});
		
		var i = 0;
		
		vault.load ({ a: i });
	},
	"error on not found extensions": function (done){
		var vault = seraphim.createVault ();
		
		vault
				.on ("error", function (error){
					assert.ok (error);
					done ();
				})
				.on ("end", function (){
					assert.fail ();
				})
				.load ("foo.bar");
	},
	"ignore not found extensions": function (done){
		var vault = seraphim.createVault ({ extensionError: false });
		
		vault
				.on ("error", function (error){
					assert.ifError (error);
				})
				.on ("end", function (){
					assert.deepEqual (this.get (), {});
					done ();
				})
				.load ("foo.bar", function (o){
					assert.ok (!o);
				});
	},
	"error on onLoad callback": function (done){
		var vault = seraphim.createVault ();
		
		vault
				.on ("error", function (error){
					assert.ok (error);
					done ();
				})
				.on ("end", function (){
					assert.fail ();
				})
				.load ({ a: 1 }, function (o, cb){
					cb (new Error ());
				});
	},
};

var keys = Object.keys (tests);
var keysLength = keys.length;

(function again (i){
	if (i<keysLength){
		var fn = tests[keys[i]];
		if (fn.length){
			fn (function (){
				again (i + 1);
			});
		}else{
			fn ();
			again (i + 1);
		}
	}
})(0);