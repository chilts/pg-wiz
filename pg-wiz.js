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
        return this.cols.map(name => `${name} AS ${this.prefix}__${name}`).join(', ')
    }

    updCols() {
        return this.cols.map((name, i) => `${name} = $${i+1}`).join(', ')
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
