"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var fs = require ("fs");
var dq = require ("deferred-queue");
var SeraphimError = require ("./error");

module.exports.createVault = function (){
	return new Vault ();
};

var Vault = function (){
	events.EventEmitter.call (this);
	
	this._obj = {};
	this._extensions = [];
	var me = this;
	this._q = dq ().on ("error", function (error){
		me.emit ("error", error);
	})
};

util.inherits (Vault, events.EventEmitter);

/*
	Because this module is mainly used to load data from external sources, the
	get(), set() and remove() functions should be as fast and thin as possible,
	therefore the keys must refer to a first deep level property, that is, the key
	is not split into namespaces.
	
	Example:
	
		obj = {
			a: {
				b: 1
			}
		}
		
		get () -> { a: { b: 1 } }
		get ("a") -> { b: 1 }
		get ("a").b -> 1
		get ("a.b") -> undefined, the key is not split
		remove ("a")
		delete get ("a").b
		delete get ().a -> same as remove ("a")
		set ("a", { c: 1 }) -> replaces the "a" object, { a: { c: 1 } }
		set ("a", 1) -> { a: 1 }
		get ("a").c = 1 -> { a: { b: 1, c: 1 } }
*/

Vault.prototype.extension = function (ext, fn){
	if (!Array.isArray (ext)) ext = [ext];
	var me = this;
	ext.forEach (function (e){
		me._extensions.push ({ extname: e, fn: fn });
	});
	return this;
};

Vault.prototype.get = function (key){
	return key ? this._obj[key] : this._obj;
};

Vault.prototype._task = function (fn, cb){
	var me = this;
	this._q.push (fn, function (error, o){
		if (error) return;
		if (cb){
			if (cb.length === 2){
				this.pause ();
				var q = this;
				cb (o, function (error){
					if (error) return me.emit ("error", error);
					if (!error && !q.pending ()) me.emit ("end");
					q.resume ();
				});
			}else{
				cb (o);
				if (!error && !this.pending ()) me.emit ("end");
			}
		}else{
			//The object is merged automatically if the callback is not provided
			me.merge (o);
			if (!error && !this.pending ()) me.emit ("end");
		}
	});
};

Vault.prototype.load = function (p, cb){
	var type = typeof p;
	
	if (type === "function"){
		this._task (function (cb){
			//Ensure the function is asynchronous, otherwise the "end" event will be
			//emitted prematurely
			process.nextTick (function (){
				if (p.length){
					p (cb);
				}else{
					//Synchronous function
					try{
						cb (null, p ());
					}catch (error){
						cb (error);
					}
				}
			});
		}, cb);
	}else if (type === "string"){
		var extname = path.extname (p);
		if (extname === ".json"){
			this._task (function (cb){
				fs.readFile (p, { encoding: "utf8" }, function (error, data){
					if (error) return cb (error);
					try{
						cb (null, JSON.parse (data));
					}catch (error){
						cb (error);
					}
				});
			}, cb);
		}else{
			//Custom extension
			var me = this;
			this._task (function (cb){
				var fn;
				for (var i=0, ii=me._extensions.length; i<ii; i++){
					if (me._extensions[i].extname === extname){
						fn = me._extensions[i].fn;
						break;
					}
				}
				if (!fn){
					cb (new SeraphimError ("Undefined extension \"" + extname + "\""));
				}else{
					fn (p, cb);
				}
			}, cb);
		}
	}else{
		//Object
		this._task (function (cb){
			//Ensure the function is asynchronous, otherwise the "end" event will be
			//emitted prematurely
			process.nextTick (function (){
				cb (null, p);
			});
		}, cb);
	}
	
	return this;
};

Vault.prototype.merge = function (o1, o2){
	//Sanity check
	if (!o1) return;

	var ret = true;
	
	if (!o2){
		ret = false;
		o2 = o1;
		o1 = this._obj;
	}
	
	(function merge (o1, o2){
		for (var p in o2){
			try{
				if (o1[p].constructor === Object){
					o1[p] = merge (o1[p], o2[p]);
				}else{
					o1[p] = o2[p];
				}
			}catch (e){
				o1[p] = o2[p];
			}
		}
		return o1;
	})(o1, o2);
	
	if (ret){
		return o1;
	}
};

Vault.prototype.remove = function (key){
	delete this._obj[key];
};

Vault.prototype.set = function (key, value){
	this._obj[key] = value;
};