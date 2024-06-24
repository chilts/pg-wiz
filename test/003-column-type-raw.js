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
        'firstname',
        'lastname',
        {
            type: 'raw',
            name: 'fullname',
            col: null,
            raw: "__PREFIX__.firstname || ' ' || __PREFIX__.lastname",
        },
    ])
    t.same(
        acc.cols,
        [
            'id',
            'firstname',
            'lastname',
            {
                type: 'raw',
                name: 'fullname',
                col: null,
                raw: "__PREFIX__.firstname || ' ' || __PREFIX__.lastname",
            },
        ],
        'Columns shows the new columns'
    )
    t.same(
        acc.normalisedCols,
        [
            {
                type: 'string',
                col: 'id',
                name: 'id',
            },
            {
                type: 'string',
                col: 'firstname',
                name: 'firstname',
            },
            {
                type: 'string',
                col: 'lastname',
                name: 'lastname',
            },
            {
                type: 'raw',
                name: 'fullname',
                col: null,
                raw: "acc.firstname || ' ' || acc.lastname",
            },
        ],
        'Columns shows the new normalised columns'
    )

    // statements
    const accSelCols = "acc.id AS acc__id, acc.firstname AS acc__firstname, acc.lastname AS acc__lastname, acc.firstname || ' ' || acc.lastname AS acc__fullname"
    t.equal(acc.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accInsFields = 'id, firstname, lastname'
    t.equal(acc.insFields(), accInsFields, 'Insert cols is correct')
    const accInsPlaceholders = '$1, $2, $3'
    t.equal(acc.insPlaceholders(), accInsPlaceholders, 'Placeholders cols is correct')
    const accUpdCols = 'id = $1, firstname = $2, lastname = $3'
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
