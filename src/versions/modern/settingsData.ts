import type { Variant } from './context'
import type { GlyphName } from './icons'

/** Settings app navigation model shared by Windows 10 and 11 (names differ slightly). */

export interface SettingsPage {
  id: string
  name: string
  desc: string
  glyph: GlyphName
}

export interface SettingsCategory {
  id: string
  name: string
  /** Windows 10 label, when it differs. */
  name10?: string
  desc: string
  desc10?: string
  glyph: GlyphName
  /** Win11 sidebar icon colour (Fluent's colourful nav icons). */
  tint: string
  pages: SettingsPage[]
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'system', name: 'System', desc: 'Display, sound, notifications, power', glyph: 'display', tint: '#0078d4',
    pages: [
      { id: 'display', name: 'Display', desc: 'Monitors, brightness, night light, display profile', glyph: 'display' },
      { id: 'sound', name: 'Sound', desc: 'Volume levels, output, input, sound devices', glyph: 'volume' },
      { id: 'notifications', name: 'Notifications', desc: 'Alerts from apps and system', glyph: 'bell' },
      { id: 'focus', name: 'Focus assist', desc: 'Notifications, automatic rules', glyph: 'focus' },
      { id: 'power', name: 'Power & battery', desc: 'Sleep, battery usage, battery saver', glyph: 'battery' },
      { id: 'storage', name: 'Storage', desc: 'Storage space, drives, configuration rules', glyph: 'storage' },
      { id: 'multitasking', name: 'Multitasking', desc: 'Snap windows, desktops, task switching', glyph: 'taskview' },
      { id: 'about', name: 'About', desc: 'Device specifications, rename PC, Windows specifications', glyph: 'info' },
    ],
  },
  {
    id: 'devices', name: 'Bluetooth & devices', name10: 'Devices', desc: 'Bluetooth, printers, mouse', glyph: 'bluetooth', tint: '#0f6cbd',
    pages: [
      { id: 'bluetooth', name: 'Bluetooth', desc: 'Discoverable as "DESKTOP-WEB"', glyph: 'bluetooth' },
      { id: 'printers', name: 'Printers & scanners', desc: 'Preferences, troubleshoot', glyph: 'documents' },
      { id: 'mouse', name: 'Mouse', desc: 'Buttons, mouse pointer speed, scrolling', glyph: 'pen' },
      { id: 'typing', name: 'Typing', desc: 'Touch keyboard, text suggestions, preferences', glyph: 'apps' },
    ],
  },
  {
    id: 'network', name: 'Network & internet', name10: 'Network & Internet', desc: 'Wi-Fi, airplane mode, VPN', glyph: 'wifi', tint: '#0067b8',
    pages: [
      { id: 'wifi', name: 'Wi-Fi', desc: 'Connect, manage known networks, metered network', glyph: 'wifi' },
      { id: 'vpn', name: 'VPN', desc: 'Add, connect, manage', glyph: 'vpn' },
      { id: 'hotspot', name: 'Mobile hotspot', desc: 'Share your internet connection', glyph: 'phone' },
      { id: 'airplane', name: 'Airplane mode', desc: 'Stop all wireless communication', glyph: 'airplane' },
    ],
  },
  {
    id: 'personalization', name: 'Personalization', desc: 'Background, lock screen, colors', glyph: 'pen', tint: '#c239b3',
    pages: [
      { id: 'background', name: 'Background', desc: 'Background image, color, slideshow', glyph: 'pictures' },
      { id: 'colors', name: 'Colors', desc: 'Accent color, transparency effects, color theme', glyph: 'pen' },
      { id: 'themes', name: 'Themes', desc: 'Install, create, manage', glyph: 'apps' },
      { id: 'lockscreen', name: 'Lock screen', desc: 'Lock screen images, apps, animations', glyph: 'lock' },
      { id: 'start', name: 'Start', desc: 'Recent apps and items, folders', glyph: 'apps' },
      { id: 'taskbar', name: 'Taskbar', desc: 'Taskbar behaviors, system pins', glyph: 'taskview' },
    ],
  },
  {
    id: 'apps', name: 'Apps', desc: 'Uninstall, defaults, optional features', glyph: 'apps', tint: '#5c5c5c',
    pages: [
      { id: 'installed', name: 'Installed apps', desc: 'Uninstall and manage apps on your PC', glyph: 'apps' },
      { id: 'defaults', name: 'Default apps', desc: 'Defaults for file and link types', glyph: 'documents' },
      { id: 'startup', name: 'Startup', desc: 'Apps that start automatically when you sign in', glyph: 'power' },
    ],
  },
  {
    id: 'accounts', name: 'Accounts', desc: 'Your accounts, email, sync, work, family', glyph: 'person', tint: '#16a085',
    pages: [
      { id: 'info', name: 'Your info', desc: 'Profile photo', glyph: 'person' },
      { id: 'email', name: 'Email & accounts', desc: 'Accounts used by email, calendar, and contacts', glyph: 'message' },
      { id: 'signin', name: 'Sign-in options', desc: 'Windows Hello, security key, password', glyph: 'lock' },
    ],
  },
  {
    id: 'time', name: 'Time & language', name10: 'Time & Language', desc: 'Speech, region, date', glyph: 'globe', tint: '#0e7a0d',
    pages: [
      { id: 'datetime', name: 'Date & time', desc: 'Time zones, automatic clock settings, calendar display', glyph: 'clock' },
      { id: 'region', name: 'Region', desc: 'Country or region, regional format', glyph: 'globe' },
      { id: 'language', name: 'Language', desc: 'Windows display language, preferred languages', glyph: 'message' },
    ],
  },
  {
    id: 'gaming', name: 'Gaming', desc: 'Xbox Game Bar, captures, Game Mode', glyph: 'game', tint: '#5c5c5c',
    pages: [
      { id: 'gamebar', name: 'Xbox Game Bar', desc: 'Controller and keyboard shortcuts', glyph: 'game' },
      { id: 'gamemode', name: 'Game Mode', desc: 'Optimize your PC for play', glyph: 'game' },
    ],
  },
  {
    id: 'accessibility', name: 'Accessibility', name10: 'Ease of Access', desc: 'Narrator, magnifier, high contrast', glyph: 'accessibility', tint: '#0078d4',
    pages: [
      { id: 'textsize', name: 'Text size', desc: 'Text size throughout Windows and apps', glyph: 'pen' },
      { id: 'contrast', name: 'Contrast themes', desc: 'Color themes for low vision, light sensitivity', glyph: 'sun' },
      { id: 'narrator', name: 'Narrator', desc: 'Voice, verbosity, keyboard, braille', glyph: 'volume' },
    ],
  },
  {
    id: 'privacy', name: 'Privacy & security', name10: 'Privacy', desc: 'Location, camera, microphone', glyph: 'shield', tint: '#5c5c5c',
    pages: [
      { id: 'security', name: 'Windows Security', desc: 'Antivirus, browser, firewall, and network protection', glyph: 'shield' },
      { id: 'location', name: 'Location', desc: 'Location services, location history', glyph: 'location' },
      { id: 'camera', name: 'Camera', desc: 'Apps that can use your camera', glyph: 'pictures' },
    ],
  },
  {
    id: 'update', name: 'Windows Update', name10: 'Update & Security', desc: 'Updates, recovery, backup', desc10: 'Windows Update, recovery, backup', glyph: 'update', tint: '#0078d4',
    pages: [
      { id: 'windowsupdate', name: 'Windows Update', desc: 'Check for updates, update history', glyph: 'update' },
      { id: 'recovery', name: 'Recovery', desc: 'Reset, advanced startup, go back', glyph: 'restart' },
    ],
  },
]

export const categoryName = (c: SettingsCategory, v: Variant) => (v === 'win10' ? c.name10 ?? c.name : c.name)
export const categoryDesc = (c: SettingsCategory, v: Variant) => (v === 'win10' ? c.desc10 ?? c.desc : c.desc)

/** Parses "system/display" → { cat, page }. "home" or unknown → { cat: null }. */
export function resolveSettingsPath(path: string): { cat: SettingsCategory | null; page: SettingsPage | null } {
  const [cid, pid] = path.split('/')
  const cat = SETTINGS_CATEGORIES.find(c => c.id === cid) ?? null
  const page = cat?.pages.find(p => p.id === pid) ?? null
  return { cat, page }
}
