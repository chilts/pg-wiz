export class Table {
    constructor(name, prefix) {
        this.name = name
        this.prefix = prefix
        this.cols = []
    }

    setCols(...cols) {
        this.cols = cols
    }
}
