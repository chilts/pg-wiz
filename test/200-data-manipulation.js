// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Column manipulation', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email', 'logins', 'inserted')

    const date = (new Date()).toISOString()
    const input = {
        acc__id: 1,
        acc__email: 'bob@example.com',
        acc__logins: 1,
        acc__inserted: date,
    }

    const input1 = Object.assign({}, input)
    const exp1 = { id: 1, email: 'bob@example.com', logins: 1, inserted: date }
    acc.flattenPrefix(input1)
    t.same(input1, exp1, 'Flattened data is correct')

    const input2 = Object.assign({}, input)
    const exp2 = { acc: exp1 }
    acc.prefixToSubObj('acc', input2)
    t.same(input2, exp2, 'Sub-Object is correct')

    t.end()
})
