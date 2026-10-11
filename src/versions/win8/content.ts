/** Canned "live" content for tiles and Modern apps (offline; nothing is fetched). */

export const WEATHER = {
  city: 'Seattle, WA',
  now: { temp: 64, cond: 'Partly Cloudy', hi: 68, lo: 52, icon: '⛅' },
  forecast: [
    { day: 'Mon', icon: '☀', hi: 70, lo: 53, cond: 'Sunny' },
    { day: 'Tue', icon: '🌧', hi: 61, lo: 50, cond: 'Light Rain' },
    { day: 'Wed', icon: '☁', hi: 63, lo: 51, cond: 'Cloudy' },
    { day: 'Thu', icon: '⛅', hi: 66, lo: 52, cond: 'Partly Sunny' },
    { day: 'Fri', icon: '☀', hi: 72, lo: 55, cond: 'Clear' },
  ],
}

export const NEWS = [
  { title: 'Touch-first computing goes mainstream as new tablets arrive', cat: 'Technology', body: 'Device makers unveiled a wave of convertible laptops and tablets designed around touch, with bright displays and all-day battery life.' },
  { title: 'Local team clinches title in dramatic overtime finish', cat: 'Sports', body: 'A last-second goal sealed the championship after a back-and-forth final period that kept fans on their feet.' },
  { title: 'Researchers map coral reef recovery in record detail', cat: 'Science', body: 'Underwater drones captured thousands of images that show encouraging signs of regrowth across protected areas.' },
  { title: 'City unveils plan for car-free downtown weekends', cat: 'Local', body: 'The pilot programme will close several central streets to traffic and open them to markets, music and cyclists.' },
  { title: 'Markets steady as investors await quarterly reports', cat: 'Money', body: 'Major indexes ended the session little changed in quiet trading ahead of a busy week of earnings.' },
]

export const MAIL = [
  { from: 'Outlook Team', subject: 'Welcome to Mail', body: 'Swipe in from the right edge (or point to the top-right corner) and pick Settings to add accounts.', time: '9:12 AM' },
  { from: 'Alex Johnson', subject: 'Lunch on Friday?', body: 'There is a new noodle place near the office — want to try it this week?', time: '8:40 AM' },
  { from: 'Store', subject: 'New apps picked for you', body: 'Discover this week\'s collection of games, productivity tools and more.', time: 'Yesterday' },
  { from: 'Mom', subject: 'Photos from the weekend', body: 'Here are the pictures from the picnic. The dog looks very proud of himself.', time: 'Yesterday' },
]

export const EVENTS = [
  { time: '10:00 AM', title: 'Team stand-up' },
  { time: '1:30 PM', title: 'Design review' },
  { time: '6:00 PM', title: 'Yoga class' },
]

/** "Photos" are generated landscapes (CSS backgrounds). */
export const PHOTOS = [
  { name: 'Sunset over the bay', bg: 'linear-gradient(180deg, #ff9a5a 0%, #ff5e62 35%, #6a3093 70%, #1b1b3a 100%)' },
  { name: 'Alpine lake', bg: 'linear-gradient(180deg, #8ec5fc 0%, #e0f2ff 40%, #3c8d5c 41%, #1f5f3f 70%, #2a7fa6 71%, #16506e 100%)' },
  { name: 'Desert dunes', bg: 'radial-gradient(ellipse at 30% 120%, #c9792c 0 40%, transparent 41%), radial-gradient(ellipse at 80% 130%, #e7a352 0 45%, transparent 46%), linear-gradient(#5bb6f0, #f8d9a0)' },
  { name: 'Northern lights', bg: 'radial-gradient(ellipse at 40% 30%, #3cffb0aa, transparent 40%), radial-gradient(ellipse at 70% 20%, #7d5cffaa, transparent 45%), linear-gradient(#020818, #0b2b3a 70%, #0f1f12)' },
  { name: 'Forest morning', bg: 'repeating-linear-gradient(90deg, #1d3b25 0 14px, #284f31 14px 22px, #183021 22px 40px), linear-gradient(#cfe8c9, #6d9f6a)' },
]

export const STORE_APPS = [
  { name: 'Tile Puzzle', cat: 'Games', color: '#d24726', rating: '★★★★☆' },
  { name: 'Recipe Box', cat: 'Food & Dining', color: '#00a300', rating: '★★★★★' },
  { name: 'Star Chart', cat: 'Education', color: '#2d89ef', rating: '★★★★☆' },
  { name: 'Pocket Budget', cat: 'Finance', color: '#603cba', rating: '★★★☆☆' },
  { name: 'Trail Maps', cat: 'Travel', color: '#00aba9', rating: '★★★★☆' },
  { name: 'Pixel Studio', cat: 'Photo', color: '#b91d47', rating: '★★★★★' },
]

export const MUSIC = [
  { title: 'Morning Commute', artist: 'The Tiles', len: '3:42' },
  { title: 'Charm Offensive', artist: 'Hot Corners', len: '4:05' },
  { title: 'Live Wallpaper', artist: 'Segoe', len: '2:58' },
  { title: 'Snap View', artist: 'The Tiles', len: '3:17' },
]
