# M2ACL - Flexible Access Control Library

### Install

    yarn add m2acl

or

    npm i m2acl

### Basic example

```javascript
import M2ACL from "m2acl"

// Create new ACL object with given actions
const acl = new M2ACL({
    actions: ["create", "read", "update", "delete"]
})

// Grant a group a permission for some resource
acl.role("public").can("read", { resource: "todo" })

const resource = {
    type: "todo",
    action: "read",
    properties: {
        id: 1,
        name: "An example todo"
    }
}

const user = {
    id: "abc",
    role: ["public", "customer"] // role can be string or array
}

const permit = acl.verify(user, resource)
permit.granted // => true
permit.properties // => { id: 1, name: "An example todo" }

const resource2 = {
    type: "todo",
    action: "create",
    properties: {
        name: "Another example"
    }
}
const permit = acl.verify(user, resource2)
permit.granted // => false since only read permission was granted
permit.properties // => null
```

For more detailed examples see the spec files in `spec/*.spec.js`

-   [Custom Permissions](./spec/custom.spec.js)
-   [Wildcard Permissions](./spec/wildcard.spec.js)

### Development

    # install dependencies
    yarn

    # run specs
    yarn spec
