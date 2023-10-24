// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('.belongsTo()', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // set up this relationship
    itm.belongsTo('account', 'account_id', acc, 'id')

    const join = {
        account: {
            name: 'account',
            type: 'belongsTo',
            // target: acc,
            sourceFieldname: 'account_id',
            targetTablename: 'account',
            targetPrefix: 'acc',
            targetFieldname: 'id',
        },
    }
    t.same(itm.relationship, join, 'The join is correct')

    const joinSql = itm.join('account')
    const joinExp = 'JOIN account acc ON ( itm.account_id = acc.id )'
    t.equal(joinSql, joinExp, 'The JOIN is as expected')

    t.end()
})

tap.test('.hasMany()', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // set up this relationship
    acc.hasMany('items', 'id', itm, 'account_id')

    const join = {
        items: {
            name: 'items',
            type: 'hasMany',
            sourceFieldname: 'id',
            // target: itm,
            targetTablename: 'item',
            targetPrefix: 'itm',
            targetFieldname: 'account_id',
        },
    }
    t.same(acc.relationship, join, 'The join is correct')

    const joinSql = acc.join('items')
    const joinExp = 'JOIN item itm ON ( acc.id = itm.account_id )'
    t.equal(joinSql, joinExp, 'The JOIN is as expected')

    t.end()
})

tap.test('Errors with relationships', t => {
    t.plan(3)

    const org = new pgWiz.Table('organisation', 'org')
    org.setCols('id', 'title', 'description')

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'organisation_id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // `.hasMany()` throws with duplicate relationships
    acc.hasMany('items', 'id', itm, 'account_id')
    t.throws(
        () => acc.hasMany('items', 'id', itm, 'account_id'),
        'Adding a 2nd relationship with the same name throws',
    )

    // `.belongsTo()` throws with duplicate relationships
    acc.belongsTo('organisation', 'organisation_id', org, 'id')
    t.throws(
        () => acc.belongsTo('organisation', 'organisation_id', org, 'id'),
        'Adding a 2nd relationship with the same name throws',
    )

    // throws if asked to join using a non-existant relationship
    t.throws(
        () => acc.join('actions'), // no 'actions'
        'Throws when asked for the join SQL for a non-existant relationship',
    )

    t.end()
})
