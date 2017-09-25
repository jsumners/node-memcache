'use strict'

const test = require('tap').test
const memcacheFactory = require('../')

test('cache stores items', (t) => {
  t.plan(6)
  const cache = memcacheFactory()
  cache.set('foo', 'foo', 100, (err) => {
    t.error(err)

    cache.get('foo', (err, cached) => {
      t.error(err)
      t.ok(cached.item)
      t.ok(cached.ttl)
      t.ok(cached.stored)
      t.ok(cached.ttl < 100)
    })
  })
})

test('cache drops items', (t) => {
  t.plan(4)
  const cache = memcacheFactory()
  cache.set('foo', 'foo', 100, (err) => {
    t.error(err)
    cache.drop('foo', (err) => {
      t.error(err)
      cache.get('foo', (err, cached) => {
        t.error(err)
        t.is(cached, null)
      })
    })
  })
})

test('watcher purges expired items', (t) => {
  t.plan(1)
  const cache = memcacheFactory(300)
  cache.set('foo', 'foo', 100, (err) => {
    if (err) t.threw(err)
    setTimeout(() => {
      t.is(cache._cache.foo, undefined)
    }, 300)
  })
})
