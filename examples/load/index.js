"use strict";

/*
Shows all the possible ways to use the load() function.
*/

var seraphim = require ("../../lib");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      console.log (config);
      /*
        { a: 1, b: 1, c: 1, d: 1, e: 1, f: 1, g: 1, h: 1, i: 1 }
      */
    })
    //Object
    .load ({ a: 1 })
    //File
    .load ("file1.json")
    //Synchronous function
    .load (function (){
      //If you return a falsy value (null, undefined, false, etc.) nothing will
      //be merged
      return { c: 1 };
    })
    //Synchronous function using the callback
    .load (function (cb){
      //The first parameter is the error
      cb (null, { d: 1 });
    })
    //Asynchronous function
    .load (function (cb){
      process.nextTick (function (){
        cb (null, { e: 1 });
      });
    })
    //Using the onLoad callback with an object
    .load ({ f: 1 }, function (o){
      //If you use the onLoad callback it returns the object that has been read,
      //but it but it is  NOT merged with the vault object, you need to merge it
      //explicitly
      this.merge (o);
    })
    //Using the onLoad callback with a file
    .load ("file2.json", function (o){
      this.merge (o);
    })
    //Using the onLoad callback with an object and an asynchronous task
    .load ({ h: 1 }, function (o, cb){
      var me = this;
      process.nextTick (function (){
        me.merge (o);
        //The first parameter is the error
        cb ();
      });
    })
    //Using the onLoad callback with a file and an asynchronous task
    .load ("file3.json", function (o, cb){
      var me = this;
      process.nextTick (function (){
        me.merge (o);
        cb ();
      });
    });