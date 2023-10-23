export class Table {
    constructor(name, prefix) {
        this.name = name
        this.prefix = prefix
        this.colPrefix = prefix + '__'
        this.cols = []
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
                        type: item.type,
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
    }

    selCols() {
        return this.normalisedCols.map(item => {
            if ( item.type === 'string' ) {
                return `${this.prefix}.${item.col} AS ${this.prefix}__${item.name}`
            }
            if ( item.type === 'raw' ) {
                return `${item.raw} AS ${this.prefix}__${item.name}`
            }
        }).join(', ')
    }

    updCols() {
        return this.normalisedCols.map((item, i) => {
            if ( item.type === 'string' ) {
                return `${item.col} = $${i+1}`
            }
            if ( item.type === 'raw' && item.col ) {
                return `${item.col} = $${i+1}`
            }
        }).filter(Boolean).join(', ')
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
