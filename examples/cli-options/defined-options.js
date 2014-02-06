"use strict";

/*
Merging CLI options with configurations files.

Defined CLI options with default values. This example depends on the "argp"
module. With others CLI parsers this example could change drastically.
*/

//Fake argv
process.argv = ["node", __filename, "--hostname", "a.b.c"];

var fs = require ("fs");
var argp = require ("argp");
var seraphim = require ("../../lib");

//Read default values
seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      //The CLI options are read after loading the config files because they
      //need a default value. You can also ignore the "default" property and
      //configure the parser like in the "complete" example
      
      var argv = argp.createParser ({ once: true })
          .body ()
              .option ({
                long: "hostname",
                metavar: "HOST",
                default: config.web.hostname
              })
              .option ({
                long: "port",
                metavar: "PORT",
                default: config.web.port,
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
      
      //Update the config object merging "argv" with "config.web"
      this.merge (config.web, argv);
      
      console.log (config);
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