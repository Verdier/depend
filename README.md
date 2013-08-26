# PolyFlow #
Depend is a *dependency injection* system.

## Usage ##

```javascript
depend = require('depend');

depend.add('service1', function () {
    return /* the service */;
});

depend.add('service2', function (service1) {
    /* depends on service1 */
    return /* the service */;
});

var service2 = depend.get('service2');
```

## Testing ##

```javascript
depend.inject('service1', function () {
    return /* mock service */
})

var service2 = depend.get('service2');
```
