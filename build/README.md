# Build Assets

This directory contains build resources for the Electron application.

## Required Icons

To complete the Electron build setup, you need to add the following icon files:

### Windows
- `icon.ico` - Windows icon file (256x256 pixels recommended)

### macOS
- `icon.icns` - macOS icon file (1024x1024 pixels recommended)

### Linux
- `icon.png` - Linux icon file (512x512 pixels recommended)

## Icon Generation

You can generate these icons from a single source image using tools like:
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
- [icon-gen](https://www.npmjs.com/package/icon-gen)
- Online converters like [iConvert Icons](https://iconverticons.com/online/)

## Temporary Solution

For testing purposes, you can use the existing `public/favicon.ico` or create simple placeholder icons. However, for production builds, you should create proper high-resolution icons that represent the Zero Vector 6 Holo brand.

## Brand Colors

Use the NSL brand colors when creating icons:
- Primary Purple: HSL(263, 70%, 60%) / #8B5CF6
- Dark Background: HSL(250, 24%, 10%) / #1a1625
