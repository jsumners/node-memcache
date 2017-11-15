'use strict'

const LMap = require('lru_map').LRUMap

function mapKey (key, segment) {
  if (typeof key === 'string') return `${segment}:${key}`
  return `${key.segment || segment}:${key.id}`
}

const cacheProto = {
  drop: function (key, callback) {
    this._cache.delete(mapKey(key, this._segment))
    callback(null)
  },

  get: function (key, callback) {
    const _key = mapKey(key, this._segment)
    const obj = this._cache.get(_key)
    if (!obj) return callback(null, null)
    const now = Date.now()
    const expires = obj.ttl + obj.stored
    const ttl = expires - now
    if (ttl < 0) {
      this._cache.delete(_key)
      return callback(null, null)
    }
    callback(null, {
      item: obj.item,
      stored: obj.stored,
      ttl
    })
  },

  keys: function () {
    return this._cache.keys()
  },

  set: function (key, value, ttl, callback) {
    this._cache.set(mapKey(key, this._segment), {
      ttl: ttl,
      item: value,
      stored: Date.now()
    })
    callback(null)
  }
}

module.exports = function (maxItems, segment) {
  const _maxItems = (maxItems && Number.isInteger(maxItems)) ? maxItems : 100000
  const map = new LMap(_maxItems)
  const cache = Object.create(cacheProto)

  const _segment = (typeof maxItems === 'string')
    ? maxItems
    : segment || 'memcache'

  Object.defineProperties(cache, {
    '_cache': {
      enumerable: false,
      value: map
    },
    '_segment': {
      enumerable: false,
      value: _segment
    }
  })
  return cache
}
