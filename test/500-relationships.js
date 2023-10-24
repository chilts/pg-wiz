// npm
import tap from 'tap'

// local
import * as pgWiz from '../pg-wiz.js'

tap.test('.hasOne()', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // set up this relationship
    itm.hasOne('account', 'account_id', acc, 'id')

    const join = {
        account: {
            name: 'account',
            type: 'hasOne',
            sourceFieldname: 'account_id',
            targetTablename: 'account',
            targetPrefix: 'acc',
            targetFieldname: 'id',
        },
    }
    t.same(itm.relationship, join, 'The join is correct')

    const joinSql = itm.join('account')
    const joinExp = 'JOIN account acc ON ( itm.account_id = acc.id )'
    t.equal(joinSql, joinExp, 'The JOIN is as expected')

    t.end()
})

tap.test('.hasMany()', t => {
    t.plan(2)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // set up this relationship
    acc.hasMany('items', 'id', itm, 'account_id')

    const join = {
        items: {
            name: 'items',
            type: 'hasMany',
            sourceFieldname: 'id',
            targetTablename: 'item',
            targetPrefix: 'itm',
            targetFieldname: 'account_id',
        },
    }
    t.same(acc.relationship, join, 'The join is correct')

    const joinSql = acc.join('items')
    const joinExp = 'JOIN item itm ON ( acc.id = itm.account_id )'
    t.equal(joinSql, joinExp, 'The JOIN is as expected')

    t.end()
})

tap.test('.mayHaveOne()', t => {
    t.plan(4)

    // i.e. Each account *might* own a car (make/model), but not every account does.
    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'car_id', 'email')

    // a car
    const car = new pgWiz.Table('car', 'car')
    car.setCols('id', 'make', 'model', 'year')

    // set up this relationship
    car.hasMany('accounts', 'id', acc, 'car_id')
    acc.mayHaveOne('car', 'car_id', car, 'id')

    // test car
    const relationshipCar = {
        accounts: {
            name: 'accounts',
            type: 'hasMany',
            sourceFieldname: 'id',
            targetTablename: 'account',
            targetPrefix: 'acc',
            targetFieldname: 'car_id',
        },
    }
    t.same(car.relationship, relationshipCar, 'The relationship is correct')

    const joinAccSql = car.join('accounts')
    const joinAccExp = 'JOIN account acc ON ( car.id = acc.car_id )'
    t.equal(joinAccSql, joinAccExp, 'The JOIN is as expected')

    // test account
    const relationshipAcc = {
        car: {
            name: 'car',
            type: 'mayHaveOne',
            sourceFieldname: 'car_id',
            targetTablename: 'car',
            targetPrefix: 'car',
            targetFieldname: 'id',
        },
    }
    t.same(acc.relationship, relationshipAcc, 'The relationship is correct')

    const joinCarSql = acc.join('car')
    const joinCarExp = 'LEFT JOIN car car ON ( acc.car_id = car.id )'
    t.equal(joinCarSql, joinCarExp, 'The JOIN is as expected')

    t.end()
})

tap.test('Many to many with a junction table', t => {
    t.plan(1)

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'email', 'username')

    const pst = new pgWiz.Table('post', 'pst')
    pst.setCols('id', 'title', 'content')

    const lik = new pgWiz.Table('like', 'lik')
    lik.setCols('id', 'account_id', 'post_id')

    // many to many relationship through the junction table 'like'

    // account 1:m likes
    acc.hasMany('likes', 'id', lik, 'account_id')
    lik.hasOne('account', 'account_id', acc, 'id')

    // post 1:m likes
    pst.hasMany('likes', 'id', lik, 'post_id')
    lik.hasOne('post', 'post_id', pst, 'id')

    const selLikesSql = `
      SELECT
        ${lik.selCols()},
        ${acc.selCols()},
        ${pst.selCols()}
      FROM
        ${lik.from()}
        ${lik.join('account')}
        ${lik.join('post')}
    `
    const selLikesExp = `
      SELECT
        lik.id AS lik__id, lik.account_id AS lik__account_id, lik.post_id AS lik__post_id,
        acc.id AS acc__id, acc.email AS acc__email, acc.username AS acc__username,
        pst.id AS pst__id, pst.title AS pst__title, pst.content AS pst__content
      FROM
        like lik
        JOIN account acc ON ( lik.account_id = acc.id )
        JOIN post pst ON ( lik.post_id = pst.id )
    `
    t.equal(selLikesExp, selLikesSql, 'The big select through a junction table is correct')

    t.end()
})

tap.test('Errors with relationships', t => {
    t.plan(4)

    const org = new pgWiz.Table('organisation', 'org')
    org.setCols('id', 'title', 'description')

    const car = new pgWiz.Table('car', 'car')
    car.setCols('id', 'make', 'model', 'year')

    const acc = new pgWiz.Table('account', 'acc')
    acc.setCols('id', 'organisation_id', 'car_id', 'email')

    // an "item" such as a "post", "tweet", "image", or "todo"
    const itm = new pgWiz.Table('item', 'itm')
    itm.setCols('id', 'account_id', 'title')

    // `.hasMany()` throws with duplicate relationships
    acc.hasMany('items', 'id', itm, 'account_id')
    t.throws(
        () => acc.hasMany('items', 'id', itm, 'account_id'),
        'Adding a 2nd relationship with the same name throws',
    )

    // `.hasOne()` throws with duplicate relationships
    acc.hasOne('organisation', 'organisation_id', org, 'id')
    t.throws(
        () => acc.hasOne('organisation', 'organisation_id', org, 'id'),
        'Adding a 2nd relationship with the same name throws',
    )

    // `.mayHaveOne()` throws with duplicate relationships
    acc.mayHaveOne('car', 'car_id', car, 'id')
    t.throws(
        () => acc.mayHaveOne('car', 'car_id', car, 'id'),
        'Adding a 2nd relationship with the same name throws',
    )

    // throws if asked to join using a non-existant relationship
    t.throws(
        () => acc.join('actions'), // no 'actions'
        'Throws when asked for the join SQL for a non-existant relationship',
    )

    t.end()
})
