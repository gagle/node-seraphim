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



#### Objects ####

- [Seraphim](#seraphim_object)

---

<a name="seraphim_object"></a>
__Seraphim__
