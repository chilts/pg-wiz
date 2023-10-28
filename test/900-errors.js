// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Set some bad column types', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')

    // table
    try {
        acc.setCols({ type: 'bob' })
    }
    catch(err) {
        t.equal(String(err), "Error: setCols() - cols argument should be an array", "The error message was correct")
    }

    // table
    try {
        acc.setCols([ { type: 'bob' } ])
    }
    catch(err) {
        t.equal(String(err), "Error: setCols() - Unknown column type of 'bob'", "The error message was correct")
    }

    t.end()
})
