seraphim
========

_Node.js project_

#### Configuration loader ####

Version: 0.0.0

Loading files in Node.js have always been a very tedious task, especially when you need to load files asynchronously or from external sources like a database, redis, etc., read the cli options and the environment variables and, finally, merge all of them in a single or multiple objects for your ease.

This module brings to you a powerful api for managing in a few lines your configuration data.

```javascript
var seraphim = require ("../lib");

seraphim.createVault ()
    .on ("error", function (error){
      console.error (error);
    })
    .on ("end", function (){
      console.log (this.get ());
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
    //Override/merge the previous settings with any object, eg: cli options
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
//production.json
{
  "web": {
    "hostname": "1.2.3.4",
    "port": 1234
  }
}
```

#### Installation ####

```
npm install seraphim
```

#### Documentation ####

- [How it works?](#how)

#### Functions ####

- [_module_.createVault([options]) : Seraphim](#createVault)

#### Objects ####

- [Seraphim](#seraphim_object)

---

<a name="how"></a>
__How it works?__

```javascript
seraphim.createVault ()
    .on ("error", ...)
    .on ("end", ...)
    .load (...)
    .load (...)
    .load (...)
    .load (...);
```

The `load()` function enqueues a task but it actually doesn't execute it. These tasks are asynchronous and they are executed in subsequent loop ticks in the same order they are enqueued, one task per tick. Therefore, at the end of the current tick the length of the queue is known so there's no need to execute a _"ok, I don't want to enqueue any more tasks, begin with the load"_ function:

```javascript
.load (...)
.load (...)
.begin () //This is not needed
```

This is possible thanks to the [deferred-queue](https://github.com/gagle/node-deferred-queue) module, a very fast control flow library.

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

__Methods__

- [Seraphim#extension(extension, fn) : Seraphim](#merge)
- [Seraphim#get() : Object](#merge)
- [Seraphim#load(resource[, onLoad]) : Seraphim](#load)
- [Seraphim#merge(o1[, o2]) : undefined | Object](#merge)

<a name="extension"></a>
__Seraphim#extension(extension, fn) : Seraphim__

Allows you to load files with an extension different from .json using the [load()](#load) function.

`extension` is a string or an array or strings.

`fn` has two parameters: the path of the file and the function to call when it finishes. This function receives two parameters: the error and object with the data.

```javascript
.extension (".properties", function (p, cb){
  fs.readFile (p, { encoding: "utf8" }, function (error, data){
    if (error) return cb (error);
    var obj = parse (data);
    cb (null, obj);
  });
})
.load ("file.properties");
```

<a name="get"></a>
__Seraphim#get() : Object__

Returns the object with all the data.

<a name="load"></a>
__Seraphim#load(resource[, onLoad]) : Seraphim__

Loads and merges a resource. It can be a string, object or function.

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

Synchronous. Return an object to be merged. Errors thrown here are catched.

```javascript
.load (function (){
  return { a: 1 };
});
```

Asynchronous. The first parameter is the error, the second is the object.

```javascript
.load (function (cb){
  process.nextTick (function (){
    cb (null, { a: 1 });
  });
});
```

`onLoad` is a callback that is executed when `load` finishes. It has two parameters: the object and a callback. The callback allows you to execute any asynchronous function between two calls to `load()`. Please note that if you use the `onLoad` callback the object is not merged automatically and you'll need to merge it explicitly.

```javascript
.load ("file.json", function (o, cb){
  //o is the json data
  //The first parameter of cb is a possible error
  process.nextTick (cb);
});
```

<a name="merge"></a>
__Seraphim#merge(o1[, o2]) : undefined | Object__

If `o2` is not used, `o1` is merged qith the internal object.
If `o2` is used, `o2` is merged with `o1` and `o1` is returned.