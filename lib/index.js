"use strict";

var events = require ("events");
var util = require ("util");
var path = require ("path");
var fs = require ("fs");
var dq = require ("deferred-queue");

module.exports.createVault = function (options){
  return new Vault (options);
};

var Vault = function (options){
  events.EventEmitter.call (this);
  
  options = options || {};
  
  this._obj = {};
  this._extensions = {};
  this._extensionError = options.extensionError !== undefined
      ? !!options.extensionError : true;
  var me = this;
  this._q = dq ().on ("error", function (error){
    me.emit ("error", error);
  })
};

util.inherits (Vault, events.EventEmitter);

Vault.prototype.extension = function (ext, fn){
  if (!Array.isArray (ext)) ext = [ext];
  var me = this;
  ext.forEach (function (e){
    me._extensions[e] = fn;
  });
  return this;
};

Vault.prototype.get = function (){
  return this._obj;
};

Vault.prototype._task = function (fn, cb){
  var me = this;
  this._q.push (fn, function (error, o){
    if (error) return;
    if (cb){
      if (cb.length === 2){
        this.pause ();
        var q = this;
        cb.call (me, o, function (error){
          if (error) return me.emit ("error", error);
          if (!error && !q.pending ()) me.emit ("end", me._obj);
          q.resume ();
        });
      }else{
        //Catch errors thrown by the callback
        try{
          cb.call (me, o);
          if (!this.pending ()) me.emit ("end", me._obj);
        }catch (error){
          this.pause ();
          me.emit ("error", error);
        };
      }
    }else{
      //The object is merged automatically if the callback is not given
      me.merge (o);
      if (!this.pending ()) me.emit ("end", me._obj);
    }
  });
};

Vault.prototype.load = function (p, cb){
  var me = this;
  
  if (typeof p === "function"){
    this._task (function (done){
      //Ensure the function is asynchronous, otherwise the "end" event will be
      //emitted prematurely
      process.nextTick (function (){
        if (p.length){
          p.call (me, done);
        }else{
          //Synchronous function
          try{
            done (null, p.call (me));
          }catch (error){
            done (error);
          }
        }
      });
    }, cb);
  }else if (typeof p === "string"){
    var extname = path.extname (p);
    if (extname === ".json"){
      this._task (function (done){
        fs.readFile (p, { encoding: "utf8" }, function (error, data){
          if (error) return done (error);
          try{
            done (null, JSON.parse (data));
          }catch (error){
            done (error);
          }
        });
      }, cb);
    }else{
      //Custom extension
      this._task (function (done){
        var fn;
        for (var e in me._extensions){
          if (e === extname){
            fn = me._extensions[e];
            break;
          }
        }
        if (!fn){
          if (me._extensionError){
            done (new Error ("Undefined extension \"" + extname + "\""));
          }else{
            //No-op if the extension has not been found
            done ();
          }
        }else{
          fn (p, done);
        }
      }, cb);
    }
  }else{
    //Object
    this._task (function (done){
      //Ensure the function is asynchronous, otherwise the "end" event will be
      //emitted prematurely
      process.nextTick (function (){
        done (null, p);
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