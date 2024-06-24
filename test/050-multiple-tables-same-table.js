// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(6)

    const cols = [
        'id',
        'email',
        {
            name: 'email_lower',
            type: 'raw',
            col: null,
            raw: 'LOWER(__PREFIX__.email)',
        }
    ]

    const normalisedCols = [
        {
            type: 'string',
            name: 'id',
            col: 'id',
        },
        {
            type: 'string',
            name: 'email',
            col: 'email',
        },
        {
            type: 'raw',
            name: 'email_lower',
            col: null,
            // raw: 'LOWER(???.email)', // to fill in for each test
        },
    ]

    const usr = new pgWiz.Table('user', 'usr')
    usr.setCols(cols)

    // a member is a user
    const mem = new pgWiz.Table('user', 'mem')
    mem.setCols(cols)

    t.same(usr.cols, cols, 'Columns shows the new columns')
    t.same(mem.cols, cols, 'Columns shows the samecolumns')

    normalisedCols[2].raw = 'LOWER(usr.email)'
    t.same(usr.normalisedCols, normalisedCols, 'Normalised Columns is correct for the main table')
    normalisedCols[2].raw = 'LOWER(mem.email)'
    t.same(mem.normalisedCols, normalisedCols, 'Normalised Columns is correct for the pseudonym table')

    const usrSelCols = 'usr.id AS usr__id, usr.email AS usr__email, LOWER(usr.email) AS usr__email_lower'
    t.equal(usr.selCols(), usrSelCols, 'Select cols is correct for organisations')
    const memSelCols = 'mem.id AS mem__id, mem.email AS mem__email, LOWER(mem.email) AS mem__email_lower'
    t.equal(mem.selCols(), memSelCols, 'Select cols is correct for charities')

    t.end()
})
