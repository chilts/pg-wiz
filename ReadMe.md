# pg-wiz

Simple SQL helper to use with `pg`. Not an ORM.

You still write SQL because it's good to learn and know. You can't paper over
something so important.

This packages has two parts to it, it helps you:

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
