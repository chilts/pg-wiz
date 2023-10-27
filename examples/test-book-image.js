// ----------------------------------------------------------------------------

// local
import * as pgWiz from '../pg-wiz.js'

// ----------------------------------------------------------------------------

// Okay, let's discuss:

// * BOOK needs to exist first, so they get inserted
// * sometimes a book already has a URL for a cover
// * but sometimes it needs an 'image' uploaded
// * therefore an image can't exist without a book
// * and it's only ever one-to-one
//
// So, we currently have:
//
// * Case 1 : `book.image_id` which points to the `image.id`
//
// but I suspect we should have:
//
// * `image.book_id` which points to the `book.id`
//
// In our case, we have:
//
// * bok.mayHaveOne('image', 'image_id', img)
// * img.hasOne('book', 'id', bok, 'image_id') // i.e. that 4th parameter is not 'id' like in many other cases
//
// In the case I think we should have:
//
// * img.hasOne('book', 'book_id', bok) // the 4th param would be just 'id'
// * bok.mayHaveOne('image', 'image_id', img))

// Yes, I think `image.book_id` should point to `book.id`.

// Also see : https://chat.openai.com/share/780ea7c8-01bb-4b1b-b51f-05d46e9078be

// ----------------------------------------------------------------------------
// Case 1

const bok1 = new pgWiz.Table('book', 'bok')
bok1.setCols(
    'id',
    'image_id',
    'title',
    'author',
)

const img1 = new pgWiz.Table('image', 'img')
img1.setCols(
    'id',
    'url',
)

// each book may have one img (same as below)
bok1.mayHaveOne('image', 'image_id', img1)

// and each image always has one book (different to below)
img1.hasOne('book', 'id', bok1, 'image_id') // this 4th param is the weird one

const sql1 = `
  SELECT
    ${bok1.selCols()},
    ${img1.selCols()}
  FROM
    ${bok1.from()}
    ${bok1.join('image')}
`
console.log('sql1:', sql1)

// ----------------------------------------------------------------------------
// Case 2

const bok2 = new pgWiz.Table('book', 'bok')
bok2.setCols(
    'id',
    'title',
    'author',
)

const img2 = new pgWiz.Table('image', 'img')
img2.setCols(
    'id',
    'book_id',
    'url',
)

// each book may have one img (same as above)
bok2.mayHaveOne('image', 'id', img2, 'book_id')

// and each image always has one book (different to above)
img2.hasOne('book', 'book_id', bok2)

const sql2 = `
  SELECT
    ${bok2.selCols()},
    ${img2.selCols()}
  FROM
    ${bok2.from()}
    ${bok2.join('image')}
`
console.log('sql2:', sql2)

// ----------------------------------------------------------------------------
