// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table class', t => {
    t.plan(2)

    const cols = [
        'id',
        'name',
        'title',
        'address1',
        'address2',
        'city',
        'postcode',
        'country',
    ]

    const org = new pgWiz.Table('organisation', 'org')
    org.setCols(...cols)

    // a charity is an organisations
    const chr = new pgWiz.Table('organisation', 'chr')
    chr.setCols(...org.cols)

    t.same(org.cols, cols, 'Columns shows the new columns')
    t.same(chr.cols, cols, 'Columns shows the samecolumns')

    t.end()
})
