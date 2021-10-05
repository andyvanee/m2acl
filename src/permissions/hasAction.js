export const hasAction = forAction => {
    return async ctx => {
        const { user, action, properties, own } = ctx

        if (action !== forAction) return false

        if (own) {
            const propertiesUid = properties.owner_id
            const userUid = user.id
            if (!(propertiesUid && userUid)) return false
            if (propertiesUid !== userUid) return false
        }
        return properties
    }
}
