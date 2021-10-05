Array.prototype.equals = function (array) {
    if (!array) return false

    if (this.length != array.length) return false

    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) return false
        } else if (this[i] != array[i]) {
            return false
        }
    }
    return true
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false })

export const assert = async (a, b) => {
    if (typeof a == "function") {
        if (a.constructor.name === "AsyncFunction") {
            a = await a()
        } else {
            a = a()
        }
    }
    if (a) {
        console.log("\x1b[32m%s\x1b[0m", `• ${b}`)
    } else {
        console.log("\x1b[31m%s\x1b[0m", `• ${b}`)
        console.log(new Error().stack.split("\n").slice(2).join("\n"))
        process.exitCode = 1
    }
}
