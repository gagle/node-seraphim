"use strict";

var fs = require ("fs");
var seraphim = require ("../../lib");
var properties = require ("properties");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      console.log (config);
      /*
        { a: 1, b: 2 }
      */
    })
    .extension ("", function (file, cb){
      //Simply read the file, it will be parsed later
      fs.readFile (file, { encoding: "utf8" }, cb);
    })
    .load ("file1", function (data){
      //file1 has .json data
      //Errors thrown here are try-catched and redirected to the "error" event
      this.merge (JSON.parse (data));
    })
    .load ("file2", function (data){
      //file2 has .properties data
      this.merge (properties.parse (data));
    })