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

test('supports configuring default segment', (t) => {
  t.plan(6)
  const cache = memcacheFactory('fooseg')
  cache.set('foo', 'foobar', 200, (err) => {
    if (err) t.threw(err)
    cache.get({id: 'foo', segment: 'fooseg'}, (err, cached) => {
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

test('supports configuring maximum items', (t) => {
  t.plan(5)
  const cache = memcacheFactory(1)
  const errHandler = (err) => {
    if (err) t.threw(err)
  }
  Promise
    .all([
      cache.set('foo', 'foo', 1000, errHandler),
      cache.set('bar', 'bar', 1000, errHandler)
    ])
    .then(() => {
      cache.get('foo', (err, cached) => {
        if (err) t.threw(err)
        t.is(cached, null)
      })
      cache.get('bar', (err, cached) => {
        if (err) t.threw(err)
        t.ok(cached)
        t.type(cached, Object)
        t.ok(cached.item)
        t.is(cached.item, 'bar')
      })
    })
    .catch(t.threw)
})

test('supports configuring maximum items and default segment', (t) => {
  t.plan(5)
  const cache = memcacheFactory(1, 'fooseg')
  const errHandler = (err) => {
    if (err) t.threw(err)
  }
  Promise
    .all([
      cache.set('foo', 'foo', 1000, errHandler),
      cache.set('bar', 'bar', 1000, errHandler)
    ])
    .then(() => {
      cache.get('foo', (err, cached) => {
        if (err) t.threw(err)
        t.is(cached, null)
      })
      cache.get({id: 'bar', segment: 'fooseg'}, (err, cached) => {
        if (err) t.threw(err)
        t.ok(cached)
        t.type(cached, Object)
        t.ok(cached.item)
        t.is(cached.item, 'bar')
      })
    })
    .catch(t.threw)
})
