// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('Create a table instance', t => {
    t.plan(9)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.tablename, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.equal(account.pk, 'id', 'Pk default is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols([ 'id', 'email', 'password' ])
    t.same(account.cols, [ 'id', 'email', 'password' ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.id AS acc__id, acc.email AS acc__email, acc.password AS acc__password'
    t.equal(account.selCols(), accSelCols, 'Select cols is correct')

    const accInsCols = 'id, email, password'
    t.equal(account.insCols(), accInsCols, 'Insert cols is correct')

    const accInsPlaceholders = '$1, $2, $3'
    t.equal(account.insPlaceholders(), accInsPlaceholders, 'Insert placeholders is correct')

    const accUpdCols = 'id = $1, email = $2, password = $3'
    t.equal(account.updCols(), accUpdCols, 'Update cols is correct')

    t.end()
})

tap.test('Create a table instance but only use a subset of columns', t => {
    t.plan(9)

    // table
    const account = new pgWiz.Table('account', 'acc')
    t.equal(account.tablename, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.equal(account.pk, 'id', 'Pk default is correct')
    t.same(account.cols, [], 'Columns is still zero')

    // cols
    account.setCols([ 'id', 'email', 'password' ])
    t.same(account.cols, [ 'id', 'email', 'password' ], 'Columns shows the new columns')

    // statements
    const accSelCols = 'acc.id AS acc__id, acc.email AS acc__email'
    t.equal(account.selCols([ 'id', 'email' ]), accSelCols, 'Select cols is correct')

    const accInsCols = 'id, email'
    t.equal(account.insCols([ 'id', 'email' ]), accInsCols, 'Insert cols is correct')

    const accInsPlaceholders = '$1, $2'
    t.equal(account.insPlaceholders([ 'id', 'email' ]), accInsPlaceholders, 'Insert placeholders is correct')

    const accUpdCols = 'id = $1, email = $2'
    t.equal(account.updCols([ 'id', 'email' ]), accUpdCols, 'Update cols is correct')

    t.end()
})

tap.test('Create a table class with a specific PK', t => {
    t.plan(4)

    // table
    const account = new pgWiz.Table('account', 'acc', 'username')
    t.equal(account.tablename, 'account', 'Name is correct')
    t.equal(account.prefix, 'acc', 'Prefix is correct')
    t.equal(account.pk, 'username', 'Primary key is correct')
    t.same(account.cols, [], 'Columns is still zero')

    t.end()
})
