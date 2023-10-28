export class Table {
    constructor(tablename, prefix, pk) {
        this.tablename = tablename
        this.prefix = prefix
        this.pk = pk || 'id'
        this.colPrefix = prefix + '__'
        this.cols = []
        this.normalisedCols = []
        this.colNames = []
        this.realCols = []
        this.realColNames = []
        this.col = {}
        this.relationship = {}
    }

    setCols(cols) {
        if ( !Array.isArray(cols) ) {
            throw new Error(`setCols() - cols argument should be an array`)
        }

        // we do various things to the incoming columns, so go through those now

        // remember them all as-is
        this.cols = cols

        // normalise them to have the same structure
        this.normalisedCols = cols.map(item => {
            if ( typeof item === 'string' ) {
                return {
                    type: 'string',
                    col: item,
                    name: item,
                }
            }
            if ( Array.isArray(item) ) {
                return {
                    type: 'string',
                    col: item[0],
                    name: item[1],
                }
            }
            if ( typeof item === 'object' ) {
                if ( item.type === 'raw' ) {
                    return {
                        type: 'raw',
                        col: item.col,
                        name: item.name,
                        raw: item.raw,
                    }
                }
                else {
                    throw new Error(`setCols() - Unknown column type of '${item.type}'`)
                }
            }
        })

        // get the column names so we have easy access
        this.colNames = this.normalisedCols.map(item => item.name)

        // get only the 'real' columns in this list
        this.realCols = this.normalisedCols.filter(item => item.col)
        this.realColNames = this.realCols.map(item => item.name)

        // and finally, map them to an object for easy lookup
        for ( const item of this.normalisedCols ) {
            this.col[item.name] = item
        }
    }

    validateColNames(fnName, colNames, defaultColNames) {
        if ( colNames ) {
            // check we know about each column
            for ( const colName of colNames ) {
                if ( !(colName in this.col) ) {
                    throw new Error(`${fnName}() - Invalid column name '${colName}' being selected`)
                }
            }
        }
        else {
            // no need to check, just assign to the incoming argument
            colNames = defaultColNames
        }

        return colNames
    }

    // selCols() with a subset of cols?
    selCols(colNames) {
        colNames = this.validateColNames('selCols', colNames, this.colNames)

        return colNames.map(colName => {
            const item = this.col[colName]

            if ( item.type === 'string' ) {
                return `${this.prefix}.${item.col} AS ${this.prefix}__${item.name}`
            }
            else if ( item.type === 'raw' ) {
                return `${item.raw} AS ${this.prefix}__${item.name}`
            }
        }).join(', ')
    }

    // This source has many of that target:
    //
    // e.g.1. this "account" has many "tweets".
    // e.g.2. this "blog" has many "posts".
    //
    // You can see that this is a one to many relationship.
    hasMany(name, target, targetFieldname) {
        if ( name in this.relationship ) {
            throw new Error(`hasMany() - a join of this name '${name}' already exists`)
        }

        this.relationship[name] = {
            name,
            type: 'hasMany',
            sourceFieldname: this.pk,
            targetTablename: target.tablename,
            targetPrefix: target.prefix,
            targetFieldname,
        }
    }

    // This source belongs to that target:
    //
    // e.g.1. this "post" belongs to that "blog".
    // e.g.2. this "tweet" belongs to that "user".
    //
    // You can see that this is a one to one relationship.
    hasOne(name, sourceFieldname, target, targetFieldname) {
        if ( name in this.relationship ) {
            throw new Error(`hasOne() - a join of this name '${name}' already exists`)
        }

        this.relationship[name] = {
            name,
            type: 'hasOne',
            sourceFieldname,
            targetTablename: target.tablename,
            targetPrefix: target.prefix,
            targetFieldname: targetFieldname || target.pk,
        }
    }

    // This source may have one target:
    //
    // e.g.1. this "book" may have an "image"
    //
    // You can see that this is an (optional) one to one relationship.
    mayHaveOne(name, sourceFieldname, target, targetFieldname) {
        if ( name in this.relationship ) {
            throw new Error(`mayHaveOne() - a join of this name '${name}' already exists`)
        }

        this.relationship[name] = {
            name,
            type: 'mayHaveOne',
            sourceFieldname,
            targetTablename: target.tablename,
            targetPrefix: target.prefix,
            targetFieldname: targetFieldname || target.pk,
        }
    }

    // ToDo: rename to insFields
    insFields(colNames) {
        colNames = this.validateColNames('insFields', colNames, this.realColNames)

        return colNames.map((colName, i) => {
            const item = this.col[colName]

            if ( item.type === 'string' ) {
                return item.col
            }
            else if ( item.type === 'raw' && item.col ) {
                return item.col
            }
        }).join(', ')
    }

    insPlaceholders(colNames) {
        colNames = this.validateColNames('insPlaceholders', colNames, this.realColNames)

        return colNames.map((colName, i) => {
            const item = this.col[colName]

            if ( item.type === 'string' ) {
                return `$${i+1}`
            }
            else if ( item.type === 'raw' && item.col ) {
                return `$${i+1}`
            }
        }).filter(Boolean).join(', ')
    }

    insCols(colNames) {
        return `(${this.insFields(colNames)}) VALUES(${this.insPlaceholders(colNames)})`
    }

    updCols(colNames) {
        colNames = this.validateColNames('updCols', colNames, this.realColNames)

        return colNames.map((colName, i) => {
            const item = this.col[colName]

            return `${item.col} = $${i+1}`
        }).join(', ')
    }

    from() {
        return `${this.tablename} ${this.prefix}`
    }

    sel(colNames) {
        return `SELECT ${this.selCols(colNames)} FROM ${this.from()}`
    }

    ins(colNames) {
        return `INSERT INTO ${this.tablename}${this.insCols(colNames)}`
    }

    upd(colNames) {
        return `UPDATE ${this.tablename} SET ${this.updCols(colNames)}`
    }

    del() {
        return `DELETE FROM ${this.from()}`
    }

    join(name) {
        const join = this.relationship[name]
        if (!join) {
            throw new Error(`join() - no relationship of name '${name}' found`)
        }

        // hasOne (always has one)
        if ( join.type === 'hasOne' ) {
            return [
                'JOIN',
                join.targetTablename,
                join.targetPrefix,
                'ON',
                '(',
                `${join.targetPrefix}.${join.targetFieldname}`,
                '=',
                `${this.prefix}.${join.sourceFieldname}`,
                ')',
            ].join(' ')
        }

        // mayHaveOne (optionally has one)
        if ( join.type === 'mayHaveOne' ) {
            return [
                'LEFT JOIN',
                join.targetTablename,
                join.targetPrefix,
                'ON',
                '(',
                `${join.targetPrefix}.${join.targetFieldname}`,
                '=',
                `${this.prefix}.${join.sourceFieldname}`,
                ')',
            ].join(' ')
        }

        // hasMany (0, 1, or many)
        if ( join.type === 'hasMany' ) {
            return [
                'JOIN',
                join.targetTablename,
                join.targetPrefix,
                'ON',
                '(',
                `${join.targetPrefix}.${join.targetFieldname}`,
                '=',
                `${this.prefix}.${join.sourceFieldname}`,
                ')',
            ].join(' ')
        }
    }

    // Takes an object and flattens all `prefix__*` keys with `*`.
    //
    // e.g. `{ acc__name } -> { name }`
    flattenPrefix(data) {
        for ( const item of this.normalisedCols ) {
            const prefixedName = `${this.prefix}__${item.name}`
            if ( prefixedName in data ) {
                data[item.name] = data[prefixedName]
                delete data[prefixedName]
            }
        }
    }

    // Takes an object and removes all `prefix__*` keys into a new object,
    // then assigns it to the `name` key.
    //
    // e.g. `{ acc__email } -> { acc: { email } }`
    prefixToSubObj(name, data) {
        const obj = {}
        for ( const item of this.normalisedCols ) {
            const prefixedName = `${this.prefix}__${item.name}`
            if ( prefixedName in data ) {
                obj[item.name] = data[prefixedName]
                delete data[prefixedName]
            }
        }
        data[name] = obj
        return obj
    }
}
