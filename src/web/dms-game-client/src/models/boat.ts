export class Boat {
    constructor(id: number, options?: { length?: number, isSunk?: boolean }) {
        this.id = id;
        if (options) {
            if (options.length) {
                this.length = options.length;
            }
            if (options.isSunk !== undefined && options.isSunk !== null) {
                this.isSunk = options.isSunk;
            }
        }
    }
    public id: number;
    public length?: number;
    public isSunk: boolean = false;
}