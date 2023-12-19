// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Column manipulation', t => {
    t.plan(3)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols([ [ 'account_id', 'id' ], 'email', 'logins', [ 'created_date', 'inserted' ] ])

    const date = (new Date()).toISOString()
    const input = {
        acc__id: 1,
        acc__email: 'bob@example.com',
        acc__logins: 1,
        acc__inserted: date,
    }
    const exp = {
        id: 1,
        email: 'bob@example.com',
        logins: 1,
        inserted: date,
    }

    const input1 = Object.assign({}, input)
    const exp1 = exp
    acc.flattenPrefix(input1)
    t.same(input1, exp1, 'Flattened data is correct')

    const input2 = Object.assign({}, input)
    const exp2 = {
        acc: exp,
    }
    const newObj = acc.prefixToSubObj('acc', input2)
    t.same(newObj, exp, 'Newly created object is correct')
    t.same(input2, exp2, 'Sub-Object is correct inside the original')

    t.end()
})

tap.test('Pushing an object into another one (i.e. each account may have 0 or 1 carpark)', t => {
    t.plan(1)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols([ 'id', 'email' ])
    const cpk = new pgWiz.Table('carpark', 'cpk')
    cpk.setCols([ 'id', 'account_id', 'spot', 'description' ])

    const date = (new Date()).toISOString()
    const input = {
        acc__id: 1,
        acc__email: 'bob@example.com',
        cpk__id: 2,
        cpk__account_id: 1,
        cpk__spot: 'C6',
        cpk__description: 'Level 3, by the left wall.',
    }
    const exp = {
        acc: {
            id: 1,
            email: 'bob@example.com',
            cpk: {
                id: 2,
                account_id: 1,
                spot: 'C6',
                description: 'Level 3, by the left wall.',
            },
        },
    }

    const input1 = structuredClone(input)
    const exp1 = exp
    cpk.prefixToSubObj('cpk', input1)
    acc.prefixToSubObj('acc', input1)
    pgWiz.moveIntoObj('cpk', 'acc', input1)
    t.same(input1, exp1, 'Newly structured data is correct')

    t.end()
})
