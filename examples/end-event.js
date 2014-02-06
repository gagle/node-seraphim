"use strict";

var seraphim = require ("../lib");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      console.log (config.x, config.x10);
      
      var me = this;
      setTimeout (function (){
        var n = config.x + 1;
        me.load ({ x: n });
        me.load ({ x10: n*10 });
      }, 1000);
    })
    .load ({ x: 0 })
    .load ({ x10: 0 });

/*
0 0
1 10
2 20
3 30
4 40
...

The "end" event is emitted every time the queue executes all the pending tasks.
This is possible because each task is executed in subsequent loop ticks, the
number of pending tasks are known at the end of the current tick.
*/