seraphim
========

#### Configuration loader ####

[![NPM version](https://badge.fury.io/js/seraphim.png)](http://badge.fury.io/js/seraphim "Fury Version Badge")
[![Build Status](https://secure.travis-ci.org/gagle/node-seraphim.png)](http://travis-ci.org/gagle/node-seraphim "Travis CI Badge")
[![Dependency Status](https://david-dm.org/gagle/node-seraphim.png)](https://david-dm.org/gagle/node-seraphim "David Dependency Manager Badge")

[![NPM installation](https://nodei.co/npm/seraphim.png?mini=true)](https://nodei.co/npm/seraphim "NodeICO Badge")

Loading configuration files in Node.js have always been a very tedious task, especially when you need to merge objects in cascade, load files asynchronously, load data from external sources like a database, redis, etc., read the CLI options and the environment variables, etc.

This module brings to you a powerful API for loading and merging your configuration data in a few lines.

```javascript
var seraphim = require ("seraphim");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      console.log (config);
      /*
      {
        web: {
          log: {
            type: "circular",
            backup: "1week"
          },
          hostname: "a.b.c",
          port: 1234
        }
      }
      */
    })
    //Default settings
    .load ("default.json")
    //NODE_ENV (development) settings
    .load (process.env.NODE_ENV + ".json")
    //Override/merge the previous settings with any object, eg: CLI options
    .load ({ web: { hostname: "a.b.c" } });
```

```
//default.json
{
  "web": {
    "log": {
      "type": "circular",
      "backup": "1week"
    }
  }
}
```

```
//development.json
{
  "web": {
    "hostname": "1.2.3.4",
    "port": 1234
  }
}
```

Check this [complete example](https://github.com/gagle/node-seraphim/tree/master/examples/complete) for further details.

#### Functions ####

- [_module_.createVault([options]) : Seraphim](#createVault)

#### Objects ####

- [Seraphim](#seraphim_object)

---

<a name="createVault"></a>
___module_.createVault([options]) : Seraphim__

Returns a new [Seraphim](#seraphim_object) instance.

Options are:

- __extensionError__ - _Boolean_  
  Set it to false if unknown extensions shouldn't emit an error. Default is true.

---

<a name="seraphim_object"></a>
__Seraphim__

__Events__

- [end](#event_end)
- [error](#event_error)

__Methods__

- [Seraphim#extension(extension, fn) : Seraphim](#extension)
- [Seraphim#get() : Object](#get)
- [Seraphim#load(resource[, onLoad]) : Seraphim](#load)
- [Seraphim#merge(o1[, o2]) : undefined | Object](#merge)

---

<a name="event_end"></a>
__end__

Arguments: `config`.

This event is emitted multiple times, when there are no more pending tasks to load.

`config` is the final merged object.

Look at the [end-event.js](https://github.com/gagle/node-seraphim/blob/master/examples/end-event.js) example for further details.

<a name="event_error"></a>
__error__

Arguments: `error`.

Emitted when an error occurs.

---

<a name="extension"></a>
__Seraphim#extension(extension, fn) : Seraphim__

Allows you to load files with an extension different from .json using the [load()](#load) function.

`extension` is a string or an array of strings.

`fn` is the function that is called when the file to load has the same `extension`. It has two arguments: the path of the file and a callback. The callback must be called with two parameters: the error and the object with the configuration data.

```javascript
seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (config){
      ...
    })
    .extension ([".yaml", ".yml"], function (p, cb){
      fs.readFile (p, { encoding: "utf8" }, function (error, data){
        if (error) return cb (error);
        var obj = parseFile (data);
        cb (null, obj);
      });
    })
    .load ("file1.yaml")
    .load ("file2.yml");
```

<a name="get"></a>
__Seraphim#get() : Object__

Returns the internal merged object.

<a name="load"></a>
__Seraphim#load(resource[, onLoad]) : Seraphim__

Loads and merges a resource. `resource` can be a string, object or function.

__String__

It must be a valid file path.

```javascript
.load ("file.json");
```

__Object__

```javascript
.load ({ a: { b: 1 } });
```

__Function__

Synchronous. Return the object to be merged. Errors thrown here are catched and forwarded to the `error` event. If a falsy value is returned (null, undefined, false, etc.) it won't be merged.

```javascript
.load (function (){
  if (condition){
    return { a: 1 };
  }
});
```

Asynchronous. Use the callback to load the next resource. The first parameter is the error, the second is the object to be merged.

```javascript
.load (function (cb){
  process.nextTick (function (){
    cb (null, { a: 1 });
  });
});
```

`onLoad` is a callback that is executed when `load()` finishes. It has two arguments: the object to be merged and a callback. The callback allows you to execute any asynchronous function between two `load()` calls. Please note that if you use the `onLoad` callback the object is not merged automatically and you'll need to merge it explicitly. This callback it's also try-catched, errors thrown inside the `onLoad` callback are redirected to the `error` event.

```javascript
.load ("file.json", function (o, cb){
  //'o' is the json object
  var me = this;
  asyncFn (function (error, foo){
    //The error is forwarded to the "error" event
    if (error) return cb (error);
    if (foo) o.bar = "baz";
    me.merge (o);
    cb ();
  });
});
```

The `onLoad` function can be used to [load files without an extension](https://github.com/gagle/node-seraphim/tree/master/examples/load-files-without-extension).

<a name="merge"></a>
__Seraphim#merge(o1[, o2]) : undefined | Object__

If `o2` is not used, `o1` is merged with the internal object.  
If `o2` is used, `o2` is merged with `o1` and `o1` is returned.

```javascript
console.log (vault.merge ({ a: 1, b: 1 }, { a: 2 }));
//{ a: 2, b: 1 }
```