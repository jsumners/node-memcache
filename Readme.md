# @jsumners/memcache

This module implements a very simple memory cache that adheres to the core
of the [Catbox][catbox] protocol. Specifically, it implements the `get`, `drop`,
and `set` methods of the Catbox protocol.

[catbox]: https://www.npmjs.com/package/catbox

## Example

```js
const cacheFactory = require('@jsumners/memcache')
const cache = cacheFactory()

cache.set('foo', 'foo', 300000, (err) => {
  if (err) throw err
})

// sometime less that 5 minutes later
cache.get('foo', (err, cached) => {
  if (err) throw err
  console.log(cached)
  // {
  //    ttl: Number,
  //    item: Object,
  //    stored: Number
  // }
})
```

## API

### cacheFactory(interval)

Constructor function that is the main export of the module. It will return
a Catbox compliant cache object.

+ `interval` (Default: `1000`): sets a time, in millisecons, that a watcher
function will use to check the cache for expired items and purge them. If the
value is `-1` then the watcher will be disabled.

#### cache.drop(key, callback)

Remove an item from the cache.

+ `key`: identifier for the object to remove from the cache.
+ `callback(err)`: due to the simple nature of this cache, `err` will always
be `null`.

#### cache.get(key, callback)

Retrieve a value stored in the cache.

Note: if the desired item's lifetime has expired, this method purges the item
from the cache and returns `null`.

+ `key`: identifier for the cached object to retrieve.
+ `callback(err, cached)`: function to invoke after retrieval. `cached` will be
`null` if the item has outlived its lifetime.

#### cache.keys()

Retrieve the list of identifiers for objects stored in the cache.

Note: the cache expires items by simply setting the key to `undefined`. Thus,
it is possible that a key may exist while the associated value does not.

Returns: an `Array` of key identifiers.

#### cache.set(key, value, ttl, callback)

Store an item in the cache.

+ `key` (required): an identifier for the value to be stored.
+ `value` (required): the value to be stored.
+ `ttl` (required): the time, in milliseconds, that the stored value should be
valid. There is not a default `ttl`; you **must** supply a `ttl`.
+ `callback(err)`: function to invoke after the item has been stored. Due to the
simple nature of this cache `err` will always be `null`.

## License

[MIT License](http://jsumners.mit-license.org/)

