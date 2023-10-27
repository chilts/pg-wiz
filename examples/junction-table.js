// ----------------------------------------------------------------------------

// local
import * as pgWiz from '../pg-wiz.js'

// ----------------------------------------------------------------------------

// let'd do users, who can "like" multiple items

const usr = new pgWiz.Table('user', 'usr')
usr.setCols(
    'id',
    'email',
    'password',
)

const itm = new pgWiz.Table('item', 'itm')
itm.setCols(
    'id',
    'user_id',
    'content',
)

// every item has an owner/author ... the user
itm.hasOne('user', 'user_id', usr)

// also, every user can own/post multiple items
usr.hasMany('items', itm, 'user_id')

// Let's find all posts by a user.
//
// Note: if I still wanted one row if there are no items, then it'd be a LEFT join to 'item'
const selItemsForUserSql = `
  SELECT
    ${itm.selCols()}
  FROM
    ${usr.from()}
    ${usr.join('items')}
  WHERE
    usr.email = $1
`
console.log('selItemsForUserSql:', selItemsForUserSql)

// ----------------------------------------------------------------------------

const lik = new pgWiz.Table('like', 'lik')
lik.setCols('id', 'user_id', 'item_id')

// each like has one user and one item
lik.hasOne('user', 'user_id', usr)
lik.hasOne('item', 'item_id', itm)

// each user may have created multiple likes
usr.hasMany('likes', 'id', lik, 'usr_id')

// each item may have been liked multiple times
itm.hasMany('likes', 'id', lik, 'itm_id')

// List all likes we have ever known.
const selLikesSql = `
  SELECT
    ${usr.selCols()},
    ${lik.selCols()},
    ${itm.selCols()}
  FROM
    ${lik.from()}
    ${lik.join('user')}
    ${lik.join('item')}
`
console.log('selLikesSql:', selLikesSql)

// ----------------------------------------------------------------------------
