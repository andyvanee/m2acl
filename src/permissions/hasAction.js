export const hasAction = forAction => {
    return async ctx => {
        const { user, data, own } = ctx

        if (own) {
            const dataUid = data.owner_id
            const userUid = user.id
            if (!(dataUid && userUid)) return false
            if (dataUid !== userUid) return false
        }
        return data
    }
}
