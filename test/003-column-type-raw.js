// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Do a raw column type', t => {
    t.plan(3)

    // table
    const acc = new pgWiz.Table('account', 'acc')

    // cols
    acc.setCols(
        'id',
        {
            type: 'raw',
            col: 'user_email',
            name: 'email',
            raw: 'LOWER(acc.user_email)',
        },
        'password',
    )
    t.same(acc.cols, [ 'id', { type: 'raw', col: 'user_email', name: 'email', raw: 'LOWER(acc.user_email)' }, 'password' ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.id AS acc__id, LOWER(acc.user_email) AS acc__email, acc.password AS acc__password'
    t.equal(acc.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accUpdCols = 'id = $1, user_email = $2, password = $3'
    t.equal(acc.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})
