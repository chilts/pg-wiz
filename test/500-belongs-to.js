// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // set up this relationship
    itm.addBelongsTo('account', acc, 'account_id', 'id')

    const join = {
        account: {
            name: 'account',
            type: 'belongsTo',
            target: acc,
            sourceFieldname: 'account_id',
            targetFieldname: 'id',
        },
    }
    t.same(itm.relationship, join, 'The join is correct')

    const joinSql = itm.join('account')
    const joinExp = 'JOIN account acc ON ( itm.account_id = acc.id )'
    t.equal(joinSql, joinExp, 'The JOIN is as expected')

    t.end()
})
