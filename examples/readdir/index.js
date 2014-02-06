"use strict";

/*
Loads all the well-known configuration files inside a directory and ignores the
rest.
*/

var fs = require ("fs");
var properties = require ("properties");
var yaml = require ("js-yaml");
var seraphim = require ("../../lib");

var loadConfigFiles = function (dir, cb){
  fs.readdir (dir, function (error, entries){
    if (error) return console.error (error);
    
    var propertiesOptions = {
      path: true,
      namespaces: true
    };
    
    //If "extensionError" is false, unknown extensions don't emit an error
    var vault = seraphim.createVault ({ extensionError: false });
    
    vault
        .on ("error", function (error){
          cb (error);
        })
        .on ("end", function (config){
          cb (null, config);
        })
        .extension (".ini", function (file, cb){
          properties.parse (file, {
            path: true,
            sections: true,
            comments: ";",
            separators: "=",
            strict: true
          }, cb);
        })
        .extension ([".yaml", ".yml"], function (file, cb){
          fs.readFile (file, { encoding: "utf8" }, function (error, data){
            if (error) return cb (error);
            try{
              cb (null, yaml.safeLoad (data));
            }catch (error){
              cb (error);
            }
          });
        });
    
    entries.forEach (function (entry){
      //load() simply enqueues an asynchronous task. They are executed in
      //subsequent loop ticks
      vault.load (entry);
    });
  });
};

loadConfigFiles (".", function (error, config){
  if (error) return console.error (error);
  
  console.log (config);
  /*
  {
    database: {
      hostname: "1.2.3.4",
      port: 1234
    },
    log: {
      type: "circular",
      backup: "1week"
    },
    web: {
      hostname: "4.3.2.1",
      port: 4321
    }
  }
  */
});