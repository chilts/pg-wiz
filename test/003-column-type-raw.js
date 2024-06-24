// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Do a raw column type with a base column', t => {
    t.plan(9)

    // table
    const acc = new pgWiz.Table('account', 'acc')

    // cols
    acc.setCols([
        'id',
        {
            type: 'raw',
            name: 'email',
            col: 'user_email',
            raw: 'LOWER(__PREFIX__.user_email)',
        },
        'password',
    ])
    t.same(acc.cols, [ 'id', { type: 'raw', col: 'user_email', name: 'email', raw: 'LOWER(__PREFIX__.user_email)' }, 'password' ], 'Columns shows the new columns')
    t.same(
        acc.normalisedCols,
        [
            {
                type: 'string',
                col: 'id',
                name: 'id',
            },
            {
                type: 'raw',
                col: 'user_email',
                name: 'email',
                raw: 'LOWER(acc.user_email)',
            },
            {
                type: 'string',
                col: 'password',
                name: 'password',
            },
        ],
        'Columns shows the new normalised columns'
    )

    // statements
    const accSelCols = 'acc.id AS acc__id, LOWER(acc.user_email) AS acc__email, acc.password AS acc__password'
    t.equal(acc.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accInsFields = 'id, user_email, password'
    t.equal(acc.insFields(), accInsFields, 'Insert cols is correct')
    const accInsPlaceholders = '$1, $2, $3'
    t.equal(acc.insPlaceholders(), accInsPlaceholders, 'Placeholders cols is correct')
    const accUpdCols = 'id = $1, user_email = $2, password = $3'
    t.equal(acc.updCols(), accUpdCols, 'Update cols is correct')

    // and check a subset of columns too
    const accInsFieldsId = 'id'
    t.equal(acc.insFields([ 'id' ]), accInsFieldsId, 'Insert cols is correct')
    const accInsPlaceholdersId = '$1'
    t.equal(acc.insPlaceholders([ 'id' ]), accInsPlaceholdersId, 'Placeholders cols is correct')
    const accUpdColsId = 'id = $1'
    t.equal(acc.updCols([ 'id' ]), accUpdColsId, 'Update cols is correct')

    t.end()
})

tap.test('Do a raw column type with no base column', t => {
    t.plan(3)

    // table
    const acc = new pgWiz.Table('account', 'acc')

    // cols
    acc.setCols([
        'id',
        {
            type: 'raw',
            name: 'now',
            col: null,
            raw: 'NOW()',
        },
    ])
    t.same(acc.cols, [ 'id', { name: 'now', type: 'raw', col: null, raw: 'NOW()' } ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.id AS acc__id, NOW() AS acc__now'
    t.equal(acc.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accUpdCols = 'id = $1'
    t.equal(acc.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})
