'use strict'

const LMap = require('lru_map').LRUMap

const cacheProto = {
  drop: function (key, callback) {
    this._cache.delete(key)
    callback(null)
  },

  get: function (key, callback) {
    const obj = this._cache.get(key)
    if (!obj) return callback(null, null)
    const now = Date.now()
    const expires = obj.ttl + obj.stored
    const ttl = expires - now
    if (ttl < 0) {
      this._cache.delete(key)
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
    this._cache.set(key, {
      ttl: ttl,
      item: value,
      stored: Date.now()
    })
    callback(null)
  }
}

module.exports = function (maxItems) {
  const _maxItems = (maxItems && Number.isInteger(maxItems)) ? maxItems : 100000
  const map = new LMap(_maxItems)
  const cache = Object.create(cacheProto)
  Object.defineProperty(cache, '_cache', {
    enumerable: false,
    value: map
  })
  return cache
}
