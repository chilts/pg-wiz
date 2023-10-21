// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(6)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.name, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols('id', 'email', 'password')
    t.same(account.cols, [ 'id', 'email', 'password' ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'id AS acc__id, email AS acc__email, password AS acc__password'
    t.equal(account.selCols(), accSelCols, 'Select cols is correct')

    // statements
    const accUpdCols = 'id = $1, email = $2, password = $3'
    t.equal(account.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})

tap.test('Column manipulation', t => {
    t.plan(4)

    const account = new pgWiz.Table('account', 'acc')

    const date = (new Date()).toISOString()
    const input = {
        acc__id: 1,
        acc__email: 'bob@example.com',
        acc__logins: 1,
        acc__inserted: date,
    }
    const exp = { id: 1, email: 'bob@example.com', logins: 1, inserted: date }

    const input1 = Object.assign({}, input)
    const obj1 = account.scrubToNewObj(input1)
    t.same(obj1, exp, 'Extracted data is correct')
    t.same(input1, {}, 'Input data is now scrubbed')

    const input2 = Object.assign({}, input)
    input2.account = account.scrubToNewObj(input2)
    t.same(input2, { account: exp }, 'Manually extracted data to an object is correct')

    const input3 = Object.assign({}, input)
    account.scrubToKey(input3)
    t.same(input3, { account: exp }, 'Extracted data to an object is correct')

    t.end()
})
