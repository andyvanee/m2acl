import { M2ACL } from "../src/index.js"
import { assert } from "./helpers.js"

const acl = new M2ACL({
    actions: ["create", "read", "update", "delete"]
})

/**
 * This is an example which uses permission arguments instead of user
 * introspection to filter properties.
 */
acl.permission("read:account", async ctx => {
    // Any permission arguments (eg: admin) are attached to context
    const { properties, admin } = ctx

    // Admin users can view everything
    if (admin) return properties

    // Other users cannot view password_hash
    return (({ password_hash, ...props }) => props)(properties)
})

acl.role("admin").can("read:account", { resource: "account", admin: true })
acl.role("member").can("read:account", { resource: "account", admin: false })

export const spec = async () => {
    const readRequest = {
        resource: "account",
        action: "read:account",
        properties: {
            id: 1,
            email: "test@example.com",
            password_hash: "supersecrethash"
        }
    }

    const adminView = await acl.verify({ role: "admin" }, readRequest)
    const memberView = await acl.verify({ role: "member" }, readRequest)
    assert(adminView.granted, "admin granted")
    assert(adminView.properties.email, "admin can view email")
    assert(
        adminView.properties.password_hash == "supersecrethash",
        "admin can view password_hash"
    )
    assert(memberView.granted, "member granted")
    assert(memberView.properties.email, "member can view email")
    assert(
        memberView.properties.password_hash == null,
        "member CANNOT view password_hash"
    )
}
