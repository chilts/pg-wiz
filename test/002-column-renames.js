// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Do column renames as part of the setup', t => {
    t.plan(6)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.tablename, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols(
        [ 'account_id', 'id' ],
        [ 'user_email', 'email' ],
        [ 'pass', 'password' ],
    )
    t.same(account.cols, [ [ 'account_id', 'id' ], [ 'user_email', 'email' ], [ 'pass', 'password' ] ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.account_id AS acc__id, acc.user_email AS acc__email, acc.pass AS acc__password'
    t.equal(account.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accUpdCols = 'account_id = $1, user_email = $2, pass = $3'
    t.equal(account.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})
