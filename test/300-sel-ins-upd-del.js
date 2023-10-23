
// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Select, Insert, Update, Delete', t => {
    t.plan(4)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols(
        'id',
        'email',
        'password',
    )

    t.equal(acc.sel(), 'SELECT acc.id AS acc__id, acc.email AS acc__email, acc.password AS acc__password FROM account acc', 'Select is correct')
    t.equal(acc.ins(), 'INSERT INTO account(id, email, password) VALUES($1, $2, $3)', 'Insert is correct')
    t.equal(acc.upd(), 'UPDATE account SET id = $1, email = $2, password = $3', 'Update is correct')
    t.equal(acc.del(), 'DELETE FROM account acc', 'Delete is correct')

    t.end()
})
