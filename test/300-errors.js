// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Set some bad column types', t => {
    t.plan(2)

    // table
    const acc = new pgWiz.Table('account', 'acc')
    try {
        acc.setCols({ type: 'bob' })
    }
    catch(err) {
        t.ok('We had an error')
        t.equal(String(err), "Error: setCols() - Unknown column type of 'bob'", 'The error message was correct')
    }

    t.end()
})
