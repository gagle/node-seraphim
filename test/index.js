"use strict";

var seraphim = require ("../lib");
var assert = require ("assert");
var properties = require ("properties");

var tests = {
	"basic usage": function (cb){
		var optionsProperties = {
			path: true,
			namespaces: true
		};
				
		var vault = seraphim.createVault ();

		vault.extension (".properties", function (p, cb){
			properties.parse (p, optionsProperties, cb)
		});

		vault.on ("error", function (error){
			assert.fail (error);
		});

		vault.on ("end", function (){
			assert.deepEqual (this.get (), {
				a: {
					b: 3,
					c: 2
				},
				x: 1,
				y: 1
			});
			cb ();
		});
				
		vault
				.load ({ a: { b: 1 } })
				.load (function (cb){
					process.nextTick (function (){
						cb (null, { a: { b: 2 }, x: 1 });
					});
				})
				.load (function (){
					return { a: { b: 3 }, y: 1 };
				})
				.load ("a.json")
				.load ("b.properties");
	},
	"multiple end events": function (cb){
		var vault = seraphim.createVault ();
		
		vault.on ("error", function (error){
			assert.fail (error);
		});

		vault.on ("end", function (){
			if (i++ === 3){
				assert.deepEqual (this.get (), {
					a: 3
				});
				cb ();
				return;
			};
			
			vault.load (this.set ("a", this.get ("a") + 1));
		});
		
		var i = 0;
				
		vault
				.load ({ a: i })
	}
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