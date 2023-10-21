export class Table {
    constructor(name, prefix) {
        this.name = name
        this.prefix = prefix
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
}
