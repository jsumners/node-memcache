'use strict'

const cacheProto = {
  drop: function (key, callback) {
    this._cache[key] = undefined
    callback(null)
  },

  get: function (key, callback) {
    const obj = this._cache[key]
    if (!obj) return callback(null, null)
    const now = Date.now()
    const expires = obj.ttl + obj.stored
    const ttl = expires - now
    if (ttl < 0) {
      this._cache[key] = undefined
      return callback(null, null)
    }
    callback(null, {
      item: obj.item,
      stored: obj.stored,
      ttl
    })
  },

  keys: function () {
    return Object.keys(this._cache)
  },

  set: function (key, value, ttl, callback) {
    this._cache[key] = {
      ttl: ttl,
      item: value,
      stored: Date.now()
    }
    callback(null)
  }
}

Object.defineProperty(cacheProto, '_cache', {
  enumerable: false,
  value: {}
})

module.exports = function (interval) {
  const cache = Object.create(cacheProto)

  if (interval !== -1) {
    const watcher = setInterval(() => {
      const now = Date.now()
      const keys = cache.keys()
      for (const key of keys) {
        if (!cache._cache[key]) continue
        const ttl = cache._cache[key].ttl
        const stored = cache._cache[key].stored
        const expires = ttl + stored
        if ((expires - now) < 0) cache._cache[key] = undefined
      }
    }, interval || 1000)
    watcher.unref()
  }

  return cache
}
