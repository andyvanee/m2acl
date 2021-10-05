import { M2ACL, hasAction } from "../src/index.js"
import { assert } from "./helpers.js"

const acl = new M2ACL({
    actions: ["read"] // no default actions
})

/**
 * This is a catch-all action permission
 */
acl.permission("*", async ctx => {
    const { properties } = ctx
    return properties
})

// Every role can perform every action on wiki resources
acl.role("*").can("*", { resource: "wiki" })

// Custom can perform any action on video resources
acl.role("custom").can("*", { resource: "video" })

// Every role can read notices
acl.role("*").can("read", { resource: "notice" })

export const spec = [
    async () => {
        const wikiCreate = {
            resource: "wiki",
            action: "create",
            properties: { name: "hi" }
        }
        const noneWiki = await acl.verify({ role: "none" }, wikiCreate)
        assert(noneWiki.granted, "anyone can create wiki - 1")

        const customWiki = await acl.verify({ role: "custom" }, wikiCreate)
        assert(customWiki.granted, "anyone can create wiki - 2")
    },

    async () => {
        const videoCreate = {
            resource: "video",
            action: "create",
            properties: { name: "hi" }
        }
        const noneVideo = await acl.verify({ role: "none" }, videoCreate)
        assert(noneVideo.granted == false, "not anyone can create video")

        const customVideo = await acl.verify({ role: "custom" }, videoCreate)
        assert(customVideo.granted, "custom can create video")
    },

    async () => {
        const videoCustom = {
            resource: "video",
            action: "some:custom:action",
            properties: { name: "hi" }
        }
        const customVideoAction = await acl.verify(
            { role: "custom" },
            videoCustom
        )
        assert(
            customVideoAction.granted,
            "custom can perform any action on video"
        )
        const noneVideoAction = await acl.verify({ role: "none" }, videoCustom)
        assert(
            noneVideoAction.granted == false,
            "not everyone can perform any action on video"
        )
    },

    async () => {
        const noticeRead = {
            resource: "notice",
            action: "read",
            properties: { name: "hi" }
        }
        const noneNotice = await acl.verify({ role: "none" }, noticeRead)
        assert(noneNotice.granted, "anyone can read notice - 1")

        const customNotice = await acl.verify({ role: "custom" }, noticeRead)
        assert(customNotice.granted, "anyone can read notice - 2")
    },

    async () => {
        const noticeCreate = {
            resource: "notice",
            action: "create",
            properties: { name: "hi" }
        }

        const noneNoticeCreate = await acl.verify(
            { role: "none" },
            noticeCreate
        )
        assert(
            noneNoticeCreate.granted == false,
            "No one can create notice - 1"
        )

        const customNoticeCreate = await acl.verify(
            { role: "custom" },
            noticeCreate
        )
        assert(
            customNoticeCreate.granted == false,
            "No one can create notice - 2"
        )
    }
]
