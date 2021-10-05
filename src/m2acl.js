/**
 * @typedef {Object} Credentials
 * @property {string} role
 */

/**
 * @typedef {Object} ResourceOp A resource operation to be verified
 * @property {string} action The operation to be completed on the resource
 * @property {string} resource The type of the resource
 * @property {any} properties The resource properties
 */

import { hasAction } from "./permissions/hasAction.js"

export class M2ACL {
    #roles = []
    /**
     * @type {Map}
     */
    #permissionConstructors = new Map()
    #permissions = []
    #currentRole = null

    constructor(props = {}) {
        const opts = Object.assign({}, props)
        if (opts.actions) {
            opts.actions.map(action => {
                this.permission(action, hasAction(action))
            })
        }
    }

    permission(name, constructor) {
        this.#permissionConstructors.set(name, constructor)
        return this
    }

    role(roleName) {
        this.#currentRole = roleName
        return this
    }

    can(action, args) {
        const ctor = this.#permissionConstructors.get(action)
        const permArgs = Object.assign({}, args)
        this.#permissions.push([ctor, this.#currentRole, action, permArgs])
        return this
    }

    /**
     *
     * @param {Credentials} credentials operation credentials
     * @param {ResourceOp|Object} resourceOp resource operation
     * @returns
     */
    async verify({ role, ...extra }, { resource, action, properties }) {
        if (!role) role = []
        if (typeof role == "string") role = [role]

        const status = {
            granted: false,
            properties: {}
        }

        for (const r of role) {
            for (const p of this.#permissions) {
                const [pfn, prole, paction, pargs] = p
                const { resource: presource } = pargs
                if (prole !== r && prole !== "*") continue
                if (paction !== action && paction !== "*") continue
                if (presource !== resource && presource !== "*") continue
                const user = Object.assign({}, extra, { role: r })
                const ctx = Object.assign({}, pargs, {
                    action,
                    role: r,
                    user,
                    resource,
                    properties
                })
                try {
                    const pres = await pfn(ctx)
                    if (pres) {
                        return {
                            granted: true,
                            properties: pres
                        }
                    }
                } catch (err) {
                    throw err
                }
            }
        }
        return status
    }

    toArray() {
        const perms = []
        for (const p of this.#permissions) {
            const [pfn, prole, paction, pargs] = p
            perms.push([prole, paction, pargs])
        }
        return perms
    }
}
