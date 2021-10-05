import fs from "fs"
import path from "path"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const run = process.argv.slice(2)

fs.promises.readdir(ROOT).then(async files => {
    for (const f of files) {
        if (/.*\.spec\.js/.test(f)) {
            if (run.length && !run.includes(f)) continue
            console.log("\x1b[32m%s\x1b[0m", `RUNNING: ${f}\n`)
            const abs = path.join(ROOT, f)
            const m = await import(abs)
            try {
                if (Array.isArray(m.spec)) {
                    for (const subM of m.spec) {
                        await subM()
                    }
                } else {
                    await m.spec()
                }
            } catch (err) {
                console.log({ err })
                console.log("error running spec")
                process.exitCode = 1
            }
            console.log()
        }
    }
})
