export class Table {
    constructor(tablename, prefix, pk) {
        this.tablename = tablename
        this.prefix = prefix
        this.pk = pk || 'id'
        this.colPrefix = prefix + '__'
        this.cols = []
        this.normalisedCols = []
        this.realCols = []
        this.relationship = {}
    }

    setCols(...cols) {
        this.cols = cols
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

        // get only the 'real' columns in this list
        this.realCols = this.normalisedCols.filter(item => item.col)
    }

    // selCols() with a subset of cols?
    selCols() {
        return this.normalisedCols.map(item => {
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

    insCols() {
        return this.realCols.map((item, i) => {
            if ( item.type === 'string' ) {
                return item.col
            }
            else if ( item.type === 'raw' && item.col ) {
                return item.col
            }
        }).join(', ')
    }

    insPlaceholders() {
        return this.realCols.map((item, i) => {
            if ( item.type === 'string' ) {
                return `$${i+1}`
            }
            else if ( item.type === 'raw' && item.col ) {
                return `$${i+1}`
            }
        }).filter(Boolean).join(', ')
    }

    updCols() {
        const cols = this.realCols.filter(item => item.col)
        return cols.map((item, i) => {
            return `${item.col} = $${i+1}`
        }).join(', ')
    }

    from() {
        return `${this.tablename} ${this.prefix}`
    }

    sel() {
        return `SELECT ${this.selCols()} FROM ${this.from()}`
    }

    ins() {
        return `INSERT INTO ${this.tablename}(${this.insCols()}) VALUES(${this.insPlaceholders()})`
    }

    upd() {
        return `UPDATE ${this.tablename} SET ${this.updCols()}`
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
