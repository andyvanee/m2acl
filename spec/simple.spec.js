import { M2ACL } from "../src/index.js"
import { assert } from "./helpers.js"

const acl = new M2ACL({
    actions: ["create", "read", "update", "delete"]
})

acl.role("admin").can("read", { resource: "video" })
acl.role("admin").can("create", { resource: "video" })
acl.role("admin").can("update", { resource: "video" })
acl.role("admin").can("delete", { resource: "video" })
acl.role("public").can("read", { resource: "video" })
acl.role("public").can("update", { resource: "video", own: true })
acl.role("public").can("undefined", { resource: "video" })

export const spec = async () => {
    const subject = {
        resource: "video",
        action: "create",
        properties: {
            id: 1,
            owner_id: 998,
            url: "123-abc"
        }
    }

    const admin1 = await acl.verify({ id: 1, role: "admin" }, subject)
    assert(admin1.granted, "Admin can create resource")

    const admin2 = await acl.verify(
        { id: 1, role: "admin" },
        Object.assign({}, subject, { action: "update" })
    )
    assert(admin2.granted, "Admin can update resource")

    const pub1 = await acl.verify(
        { id: 998, role: "public" },
        Object.assign({}, subject, { action: "create" })
    )
    assert(pub1.granted === false, "public cannot create")

    const pub2 = await acl.verify(
        { id: 998, role: "public" },
        Object.assign({}, subject, { action: "update" })
    )
    assert(pub2.granted, "public can update their own resource")

    const pub3 = await acl.verify(
        { id: 1, role: "public" },
        Object.assign({}, subject, { action: "update" })
    )
    assert(pub3.granted === false, "public cannot update others' resources")

    await assert(async () => {
        try {
            await acl.verify(
                { id: 1, role: "public" },
                Object.assign({}, subject, { action: "undefined" })
            )
            assert(false, "should not be possible")
        } catch (err) {
            return true
        }
    }, "undefined throws error")
}
