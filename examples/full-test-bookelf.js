// ----------------------------------------------------------------------------

// npm
import pg from 'pg'

// local
import * as pgWiz from '../pg-wiz.js'

// ----------------------------------------------------------------------------

// setup
const pool = new pg.Pool({
    connectionString: 'postgres://bookelf@localhost:5433/bookelf',
    idleTimeoutMillis: 250,
    connectionTimeoutMillis: 250,
})

// tables

const acc = new pgWiz.Table('account', 'acc')
acc.setCols('id', 'email', 'pwhash', 'verified')

const lib = new pgWiz.Table('library', 'lib')
lib.setCols('id', 'account_id', 'title')

const loc = new pgWiz.Table('location', 'loc')
loc.setCols('id', 'library_id', 'title', 'description', 'inserted', 'updated')

const img = new pgWiz.Table('image', 'img')
img.setCols('id', 'library_id', 'account_id', 'url', 'filename', 'mimetype', 'size', 'cloudinary', 'inserted', 'updated')

const isb = new pgWiz.Table('isbn', 'isb')
isb.setCols('id', 'metadata_id', 'isbn', 'inserted', 'updated')

const met = new pgWiz.Table('metadata', 'met')
met.setCols('id', 'metadata', 'image', 'inserted', 'updated')

const bok = new pgWiz.Table('book', 'bok')
bok.setCols(
    'id',
    'library_id',
    'location_id',
    'isbn_id',
    'image_id',
    'barcode',
    'title',
    'author',
    'illustrator',
    'tagstr',
    'tags',
    'stems',
    'note',
    'inserted',
    'updated',
)

// add relationships
acc.hasMany('libraries', lib, 'account_id')
lib.hasOne('account', 'account_id', acc)

// locations belong to libraries
loc.hasOne('library', 'library_id', lib)
lib.hasMany('locations', loc, 'library_id')

// images belong to libraries, accounts, and books
img.hasOne('library', 'library_id', lib)
img.hasOne('account', 'account_id', acc)
img.hasOne('book', 'id', bok, 'image_id')

// books belong to libraries
bok.hasOne('library', 'library_id', lib)
lib.hasMany('books', bok, 'library_id')
// books also have a location
bok.hasOne('location', 'location_id', loc)
// books may have one image
bok.mayHaveOne('image', 'image_id', img)
// books may have one ISBN
bok.mayHaveOne('isbn', 'isbn_id', isb)

// ISBNs have a metadata
isb.hasOne('metadata', 'metadata_id', met)

// ----------------------------------------------------------------------------
// sql

const selLibrariesWithAccountSql = `
  SELECT
    ${lib.selCols()},
    ${acc.selCols()}
  FROM
    ${lib.from()}
    ${lib.join('account')}
`

const selAccountWithLibrariesSql = `
  SELECT
    ${acc.selCols()},
    ${lib.selCols()}
  FROM
    ${acc.from()}
    ${acc.join('libraries')}
`

const selBooksWithLocationLibraryAccountImageSql = `
  SELECT
    ${bok.selCols()},
    ${loc.selCols()},
    ${lib.selCols()},
    ${acc.selCols()},
    ${img.selCols()},
    ${isb.selCols()},
    ${met.selCols()}
  FROM
    ${bok.from()}
    ${bok.join('location')}
    ${bok.join('library')}
    ${lib.join('account')}
    ${bok.join('image')}
    ${bok.join('isbn')}
    ${isb.join('metadata')}
`

// ----------------------------------------------------------------------------
// main

await selLibrariesWithAccount()
await selAccountWithLibraries()
await selBooksWithLocationLibraryAccountImage()

// ----------------------------------------------------------------------------
// functions

async function selLibrariesWithAccount() {
    await go('selLibrariesWithAccountSql', pool, selLibrariesWithAccountSql)
}

async function selAccountWithLibraries() {
    await go('selAccountWithLibrariesSql', pool, selAccountWithLibrariesSql)
}

async function selBooksWithLocationLibraryAccountImage() {
    const books = await go('selBooksWithLocationLibraryAccountImageSql', pool, selBooksWithLocationLibraryAccountImageSql)

    // let's manipulate the books a bit
    for ( const book of books ) {
        // flatten metadata
        const metadata = met.prefixToSubObj('metadata', book)

        // flatten isbn and put metadata in it
        isb.prefixToSubObj('isbn', book)
        book.isbn.metadata = metadata
        delete book.metadata

        // flatten image
        img.prefixToSubObj('image', book)

        // flatten account
        acc.prefixToSubObj('account', book)

        // flatten library
        lib.prefixToSubObj('library', book)

        // put the account inside the library
        book.library.account = book.account
        delete book.account

        // flatten the location
        loc.prefixToSubObj('location', book)

        // finally, just flatten the book
        bok.flattenPrefix(book)
    }

    console.log('books:', JSON.stringify(books, null, 2))
}

// ----------------------------------------------------------------------------
// helpers

async function go(title, poc, text, ...values) {
    console.log(''.padStart(79, '-'))
    console.log(`--- ${title} ---`)
    console.log()
    console.log('```')
    console.log('  ' + text.trim())
    console.log('```')
    console.log()

    const query = { text, values }
    const result = await poc.query(query)
    console.log('result:', JSON.stringify(result.rows, null, 2))
    console.log('count:', result.rows.length)
    console.log(''.padStart(79, '-'))
    return result.rows
}

// ----------------------------------------------------------------------------
