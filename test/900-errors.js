// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Set some bad column types', t => {
    t.plan(3)

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

    // now add some valid columns, then try and select ones that don't exist
    acc.setCols([ 'id', 'email', 'password' ])
    try {
        acc.selCols([ 'id', 'email', 'passwd' ])
    }
    catch(err) {
        t.equal(String(err), "Error: selCols() - Invalid column name 'passwd' being selected", "The error message was correct")
    }

    t.end()
})
