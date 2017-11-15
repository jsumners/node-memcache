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

test('keys can be objects', (t) => {
  t.plan(6)
  const cache = memcacheFactory()
  cache.set({id: 'foo', segment: 'bar'}, 'foobar', 200, (err) => {
    if (err) t.threw(err)
    cache.get({id: 'foo', segment: 'bar'}, (err, cached) => {
      if (err) t.threw(err)
      t.type(cached, Object)
      t.ok(cached.item)
      t.ok(cached.ttl)
      t.ok(cached.stored)
      t.ok(cached.ttl)
      t.is(cached.item, 'foobar')
    })
  })
})
