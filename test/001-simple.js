// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(4)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.name, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols('id', 'email', 'password')
    t.same(account.cols, [ 'id', 'email', 'password' ], 'Columns shows the new columns')

    t.end()
})
