export class Table {
    constructor(tablename, prefix) {
        this.tablename = tablename
        this.prefix = prefix
        this.colPrefix = prefix + '__'
        this.cols = []
        this.normalisedCols = []
        this.realCols = []
        this.relationship = {}
    }

    // This source belongs to that target:
    //
    // e.g.1. this "post" belongs to that "blog".
    // e.g.2. this "tweet" belongs to that "user".
    //
    // You can see that this is a one to many relationship.
    addBelongsTo(name, target, sourceFieldname, targetFieldname) {
        if ( name in this.relationship ) {
            throw new Error(`addBelongsTo() - a join of this name '${name}' already exists`)
        }

        this.relationship[name] = {
            name,
            type: 'belongsTo',
            target,
            sourceFieldname,
            targetFieldname,
        }
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

    sel() {
        return `SELECT ${this.selCols()} FROM ${this.tablename} ${this.prefix}`
    }

    ins() {
        return `INSERT INTO ${this.tablename}(${this.insCols()}) VALUES(${this.insPlaceholders()})`
    }

    upd() {
        return `UPDATE ${this.tablename} SET ${this.updCols()}`
    }

    del() {
        return `DELETE FROM ${this.tablename} ${this.prefix}`
    }

    join(name) {
        const join = this.relationship[name]
        if (!join) {
            throw new Error(`join() - no relationship of name '${name}' found`)
        }

        // belongsTo
        return [
            'JOIN',
            join.target.tablename,
            join.target.prefix,
            'ON',
            '(',
            `${this.prefix}.${join.sourceFieldname}`,
            '=',
            `${join.target.prefix}.${join.targetFieldname}`,
            ')',
        ].join(' ')
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
    }
}
