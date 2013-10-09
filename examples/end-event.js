"use strict";

/*
The "end" event is emitted every time the queue executes all the pending tasks
and is empty.
*/

var seraphim = require ("../lib");

seraphim.createVault ()
		.on ("error", function (error){
			console.error (error);
		})
		.on ("end", function (){
			console.log (this.get ("x"), this.get ("x10"));
			
			var me = this;
			setTimeout (function (){
				var n = me.get ().x + 1;
				me.load ({ x: n });
				me.load ({ x10: n*10 });
			}, 1000);
		})
		.load ({ x: 0 })
		.load ({ x10: 0 })

/*
0 0
1 10
2 20
3 30
4 40
...

Note that the "end" event is emitted after the "x10" property, just when the
queue is empty and doesn't have any pending tasks.

This is possible because each task is executed on subsequent loop ticks, the
total number of pending tasks are known at the end of the current tick. There's
no need to call a "ok, I don't want to enqueue any more files, begin with the
load" function:

.load (...)
.load (...)
.begin () //This is not needed
*/