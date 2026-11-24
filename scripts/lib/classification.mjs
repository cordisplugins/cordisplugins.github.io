/**
 * The classification override file (src/data/classification-overrides.json) places plugins whose authors have not added
 * `cordis-kind-*` / `cordis-domain-*` keywords. It is read only once its `status` starts with "approved" (the owner's yes, spec 053 B);
 * an author's own keyword always wins, field by field.
 */
export function overridesApproved(file) {
  return typeof file?.status === 'string' && /^approved\b/u.test(file.status)
}

export function withOverride(plugin, file) {
  if (!overridesApproved(file)) return plugin
  const row = file.overrides?.[plugin.name]
  if (row === undefined) return plugin
  const sameDomain = plugin.domain === undefined || plugin.domain === row.domain
  return {
    ...plugin,
    kind: plugin.kind ?? row.kind,
    domain: plugin.domain ?? row.domain,
    ...(plugin.component !== undefined ? {} : row.component !== undefined && sameDomain ? { component: row.component } : {}),
  }
}
