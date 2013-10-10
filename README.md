seraphim
========

_Node.js project_

#### Configuration loader ####

Version: 0.0.0

Loading files in Node.js have always been a very tedious task, especially when you need to load files asynchronously or from external sources like a database, redis, etc., read the cli options and the environment variables and, finally, merge all of them in a single or multiple objects for your ease.

This module brings to you a powerful api for managing your configuration data.

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
    /*
    Default settings
    default.json
    {
      "web": {
        "log": {
          "type": "circular",
          "backup": "1week"
        }
      }
    }
    */
    .load ("a.json")
    /*
    NODE_ENV settings
    development.json
    {
      "web": {
        "hostname": "1.2.3.4",
        "port": 1234
      }
    }
    */
    .load ("b.json")
    //Override/merge the previous settings with any object, eg: cli options
    .load ({ web: { hostname: "a.b.c" } });
```

#### Installation ####

```
npm install seraphim
```

#### Documentation ####

- [How it works](#how)

#### Functions ####

- [_module_.createVault([options]) : Seraphim](#createVault)

#### Objects ####

- [Seraphim](#seraphim_object)

---

<a name="how"></a>
__How it works__

```javascript
seraphim.createVault ()
    .on ("error", ...)
    .on ("end", ...)
    .load (...)
    .load (...)
    .load (...)
    .load (...);
```

The `load()` function enqueues a task but it actually doesn't execute it. These tasks are asynchronous and they are executed in subsequent loop ticks in the same order they are enqueued, one task per tick. Therefore, at the end of the current tick the length of the queue is known so there's no need to execute a _"ok, I don't want to enqueue any more tasks, begin with the
load"_ function:

```javascript
.load (...)
.load (...)
.begin () //This is not needed
```

---

<a name="createvault"></a>
___module_.createVault([options]) : Seraphim__

Returns a new [Seraphim](#seraphim_object) instance.

Options are:

- __extensionError__ - _Boolean_  
  Set it to false if unknown extensions shouldn't emit an error. Default is true.

---

<a name="seraphim_object"></a>
__Seraphim__

