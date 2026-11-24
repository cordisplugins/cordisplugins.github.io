import type { Plugin } from '../../src/lib/registry-data'

export function overridesApproved(file: { status?: string } | undefined): boolean
export function withOverride(plugin: Plugin, file: { status?: string; overrides?: Record<string, { kind: string; domain: string; component?: string }> }): Plugin
