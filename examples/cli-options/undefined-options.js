"use strict";

/*
Merging CLI options with configurations files.

Undefined CLI options.
*/

//Fake argv
process.argv = ["node", __filename, "--hostname", "a.b.c"];

var fs = require ("fs");
var argp = require ("argp");
var seraphim = require ("../../lib");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
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
    .load ("web.json")
    .load (function (){
      var argv = argp.createParser ({ once: true })
          .allowUndefinedArguments ()
          .allowUndefinedOptions ()
          .argv ();
          
      var config = this.get ();
      
      if (argv.hostname) config.web.hostname = argv.hostname;
      if (argv.port) config.web.port = argv.port;
    });