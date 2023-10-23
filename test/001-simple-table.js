// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(6)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.tablename, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols('id', 'email', 'password')
    t.same(account.cols, [ 'id', 'email', 'password' ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.id AS acc__id, acc.email AS acc__email, acc.password AS acc__password'
    t.equal(account.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accUpdCols = 'id = $1, email = $2, password = $3'
    t.equal(account.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})
