"use strict";

//Fake environment vars
process.env.NODE_ENV = "development";
process.env.DATABASE_HOSTNAME = "a.b.c";

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
				log: {
					type: "circular",
					backup: "1week"
				},
				web: {
					hostname: "a.b.c",
					port: 4321
				}
			}
			*/
		})
		//Common config between production and development
		.load ("config.json")
		.load (file, function (o){
			//If you pass a callback, it returns the object that has been read, but it
			//is NOT merged with the vault object, you need to merge it explicitly
			
			//Override default values if DATABASE_HOSTNAME env var is specified
			if (process.env.DATABASE_HOSTNAME){
				o.web.hostname = process.env.DATABASE_HOSTNAME;
			}
			
			this.merge (o);
		});