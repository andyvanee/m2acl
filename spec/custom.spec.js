import { M2ACL, hasAction } from "../src/index.js"
import { assert } from "./helpers.js"

const acl = new M2ACL({
    actions: ["create", "update", "delete"] // no read action
})

/**
 * This is an example custom permission that extends the read action to
 * include admin checking as well as property checking
 */
acl.permission("read", async ctx => {
    // First check that this is a read request
    if (!(await hasAction("read")(ctx))) return false

    const { user, data } = ctx

    // Admin users can view everything
    if (user.role == "admin") return data

    // Check some condition of the given user and data
    if (!user.example__id) return false
    if (user.example__id == data.owner___example__id) return data

    return false
})

acl.role("admin").can("read", { resource: "video" })
acl.role("member").can("read", { resource: "video" })

export const spec = async () => {
    const subject = {
        resource: "video",
        action: "read",
        data: {
            id: 1,
            owner___example__id: 1,
            url: "123-abc"
        }
    }

    const admin1 = await acl.verify({ example__id: 1, role: "admin" }, subject)
    assert(admin1.granted, "Admin can read own resource")

    const admin2 = await acl.verify({ example__id: 2, role: "admin" }, subject)
    assert(admin2.granted, "Admin can read others' resource")

    const member1 = await acl.verify(
        { example__id: 1, role: "member" },
        subject
    )
    assert(member1.granted, "Member can read own resource")

    const member2 = await acl.verify(
        { example__id: 2, role: "member" },
        subject
    )
    assert(member2.granted == false, "Member cannot read others' resource")
}
