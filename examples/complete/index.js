"use strict";

/*
Complete example with:
- Multiple environments (production, development).
- CLI options.
- Multiple config files.

This is the most common scenario.

The "argp" module is used to parse the cli options.
*/

//Fake environment vars
process.env.NODE_ENV = "development";
process.env.DATABASE_HOST = "10.0.0.1";
process.env.DATABASE_PORT = "1337";

//Fake argv
process.argv = ["node", __filename, "--db-port", "1338"];

var argp = require ("argp");
var seraphim = require ("../../lib");

var loadConfig = function (cb){
  //Configure and parse the CLI options
  var argv = argp.createParser ({ once: true })
      .body ()
          .option ({
            long: "db-host",
            metavar: "HOST"
          })
          .option ({
            long: "db-port",
            metavar: "PORT",
            type: Number
          })
      .argv ();
  
  var envConfigFile;
  if (process.env.NODE_ENV === "production"){
    envConfigFile = "production.json";
  }else{
    envConfigFile = "development.json";
  }

  seraphim.createVault ()
      .on ("error", function (error){
        cb (error);
      })
      .on ("end", function (config){
        cb (null, config);
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
        if (process.env.DATABASE_HOST){
          o.database.hostname = process.env.DATABASE_HOST;
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
      });
};

//Load the configuration
loadConfig (function (error, config){
  if (error) return console.error (error);
  
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