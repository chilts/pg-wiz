export class Table {
    constructor(name, prefix) {
        this.name = name
        this.prefix = prefix
        this.colPrefix = prefix + '__'
        this.cols = []
    }

    setCols(...cols) {
        this.cols = cols
    }

    selCols() {
        return this.cols.map(item => {
            if ( typeof item === 'string' ) {
                return `${this.prefix}.${item} AS ${this.prefix}__${item}`
            }
            if ( Array.isArray(item) ) {
                return `${this.prefix}.${item[0]} AS ${this.prefix}__${item[1]}`
            }
        }).join(', ')
    }

    updCols() {
        return this.cols.map((item, i) => {
            if ( typeof item === 'string' ) {
                return `${item} = $${i+1}`
            }
            if ( Array.isArray(item) ) {
                return `${item[0]} = $${i+1}`
            }
        }).join(', ')
    }

    scrubToNewObj(obj) {
        const newObj = {}
        for ( const key of Object.keys(obj) ) {
            if ( key.startsWith(this.colPrefix) ) {
                newObj[key.substr(this.colPrefix.length)] = obj[key]
                delete obj[key]
            }
        }
        return newObj
    }

    scrubToKey(obj) {
        const newObj = {}
        for ( const key of Object.keys(obj) ) {
            if ( key.startsWith(this.colPrefix) ) {
                newObj[key.substr(this.colPrefix.length)] = obj[key]
                delete obj[key]
            }
        }
        obj[this.name] = newObj
    }
}
