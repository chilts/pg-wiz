# pg-wiz

Simple SQL helper to use with `pg`. Not an ORM.

You still write SQL because it's good to learn and know. You can't paper over
something so important.

This package has two parts to it.

Firstly, it helps you write you SQL in a more concise manor as well as keeping
everything consistent, including column names. It also helps you keep track
(and have smaller code) and use things like the tablename, the pk, and joins in
your SQL so you don't have to keep typing things out.

The second part of this package is to help manipulate the resultant data
received from the database. As you'll notice we prefix all column names from
each table with the `${prefix}__` so that you know which table each came from,
but then we also provide helpers to manipulate these columns into a
hierarchical structure so it's easier for your code to work with (as well as
removing the prefix).

(Side note: I've seen too much code over the years where they are selecting
different columns with the same name and it's hard to know what that particular
programming language or library will return, whether it's the first or last
mention of the same column name.)

1. define and create your SQL
2. manipulate the returns rows into something better

## Synopsis

```
import * as pgWiz from 'pg-wiz'

const acc = new pgWiz.Table('account', 'acc')
acc.setCols('id', 'email', 'username')

console.log(acc.selCols())
// -> acc.id AS acc__id, acc.email AS acc__email, acc.username AS acc__username
```

## License

ISC.

(Ends)
