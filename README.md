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

const user = {
    id: "abc",
    role: "public" // role can be string or array
}

// Async wrapper since verify is promise-based
;(async () => {
    const permit1 = await acl.verify(user, {
        resource: "todo",
        action: "read",
        properties: {
            id: 1,
            name: "An example todo"
        }
    })
    permit1.granted // => true
    permit1.properties // => { id: 1, name: "An example todo" }
    console.log({ permit1 })

    const permit2 = await acl.verify(user, {
        type: "todo",
        action: "create",
        properties: {
            name: "Another example"
        }
    })
    permit2.granted // => false since only read permission was granted
    permit2.properties // => null
    console.log({ permit2 })
})()
```

For more detailed examples see the spec files in `spec/*.spec.js`

-   [Custom Permissions](./spec/custom.spec.js)
-   [Wildcard Permissions](./spec/wildcard.spec.js)
-   [Property Filters](./spec/property-filter.spec.js)
-   [Permission Arguments](./spec/permission-args.spec.js)

### Advanced tips

Property filters and Permission arguments are only for basic schema validation
and property checking. For more complex schema enforcement or filtering, you
should use a library like [Joi](https://joi.dev/) within your callback
functions.

### Development

    # install dependencies
    yarn

    # run specs
    yarn spec
