"use strict";

//Fake environment vars
process.env.NODE_ENV = "development";
process.env.DATABASE_HOST = "a.b.c";

var seraphim = require ("../../lib");

var file;
if (process.env.NODE_ENV === "production"){
	file = "production.json";
}else{
	file = "development.json";
}

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
					port: 4321
				}
			}
			*/
		})
		.load (file, function (o){
			//If you pass a callback, it returns the object that has been read, but it
			//is NOT merged with the vault object, you need to merge it explicitly
			
			//Override default values if DATABASE_HOST env var is specified
			if (process.env.DATABASE_HOST){
				o.web.hostname = process.env.DATABASE_HOST;
			}
			
			this.merge (o);
		});