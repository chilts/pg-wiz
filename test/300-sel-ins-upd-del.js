
// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Select, Insert, Update, Delete', t => {
    t.plan(7)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols([
        'id',
        'email',
        'password',
    ])

    t.equal(acc.sel(), 'SELECT acc.id AS acc__id, acc.email AS acc__email, acc.password AS acc__password FROM account acc', 'Select is correct')
    t.equal(acc.ins(), 'INSERT INTO account(id, email, password) VALUES($1, $2, $3)', 'Insert is correct')
    t.equal(acc.upd(), 'UPDATE account SET id = $1, email = $2, password = $3', 'Update is correct')
    t.equal(acc.del(), 'DELETE FROM account acc', 'Delete is correct')

    // do some column subsets
    t.equal(acc.sel([ 'id' ]), 'SELECT acc.id AS acc__id FROM account acc', 'Select is correct')
    t.equal(acc.ins([ 'id' ]), 'INSERT INTO account(id) VALUES($1)', 'Insert is correct')
    t.equal(acc.upd([ 'id' ]), 'UPDATE account SET id = $1', 'Update is correct')

    t.end()
})

tap.test('Select, Insert, Update, Delete with a raw column with backing col', t => {
    t.plan(7)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols([
        'id',
        {
            name: 'email',
            type: 'raw',
            col: 'email',
            raw: 'LOWER(__PREFIX__.email)',
        },
        'password',
    ])

    t.equal(acc.sel(), 'SELECT acc.id AS acc__id, LOWER(acc.email) AS acc__email, acc.password AS acc__password FROM account acc', 'Select is correct')
    t.equal(acc.ins(), 'INSERT INTO account(id, email, password) VALUES($1, $2, $3)', 'Insert is correct')
    t.equal(acc.upd(), 'UPDATE account SET id = $1, email = $2, password = $3', 'Update is correct')
    t.equal(acc.del(), 'DELETE FROM account acc', 'Delete is correct')

    // do some column subsets
    t.equal(acc.sel([ 'id' ]), 'SELECT acc.id AS acc__id FROM account acc', 'Select is correct')
    t.equal(acc.ins([ 'id' ]), 'INSERT INTO account(id) VALUES($1)', 'Insert is correct')
    t.equal(acc.upd([ 'id' ]), 'UPDATE account SET id = $1', 'Update is correct')

    t.end()
})

tap.test('Select, Insert, Update, Delete with a raw column with no backing col', t => {
    t.plan(7)

    const prp = new pgWiz.Table('property', 'prp')
    prp.setCols([
        'key',
        'val',
        {
            name: 'now',
            type: 'raw',
            col: null,
            raw: 'NOW()',
        },
    ])

    t.equal(prp.sel(), 'SELECT prp.key AS prp__key, prp.val AS prp__val, NOW() AS prp__now FROM property prp', 'Select is correct')
    t.equal(prp.ins(), 'INSERT INTO property(key, val) VALUES($1, $2)', 'Insert is correct')
    t.equal(prp.upd(), 'UPDATE property SET key = $1, val = $2', 'Update is correct')
    t.equal(prp.del(), 'DELETE FROM property prp', 'Delete is correct')

    // do some column subsets
    t.equal(prp.sel([ 'key', 'val' ]), 'SELECT prp.key AS prp__key, prp.val AS prp__val FROM property prp', 'Select is correct')
    t.equal(prp.ins([ 'key', 'val' ]), 'INSERT INTO property(key, val) VALUES($1, $2)', 'Insert is correct')
    t.equal(prp.upd([ 'key', 'val' ]), 'UPDATE property SET key = $1, val = $2', 'Update is correct')

    t.end()
})
