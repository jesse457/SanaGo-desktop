# Wine Installation and Configuration for Windows Builds

## Wine Installation

To build and run Windows applications on Linux, you need to install Wine. Wine (Wine Is Not an Emulator) allows you to run Windows applications directly on Linux.

### For Debian/Ubuntu/Linux Mint systems:

Open a terminal and run:

```bash
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install -y wine wine32 wine64 winbind imagemagick
```

### Verifying Installation:

After installation, verify Wine is working:

```bash
wine --version
```

### Initial Wine Configuration:

The first time you run Wine, it will create a configuration directory:

```bash
winecfg
```

This will also install Mono and Gecko if needed.

## Converting Logo to Windows ICO Format

Windows installers require an ICO file for icons. Convert your PNG logo to ICO format:

```bash
# Navigate to the build directory
cd build

# Convert PNG to ICO using ImageMagick
convert logo.png -resize 256x256 logo.ico

# Verify the ICO file was created
ls -la
```

## Building Windows Installer

Once Wine is installed and configured, you can build the Windows installer:

```bash
# Install dependencies
npm install

# Build the application
npm run build:win
```

The installer will be created in the `release` directory as `Sanago-0.0.1-setup.exe`.

## Testing the Windows Application on Linux

To run the built Windows application directly on Linux using Wine:

```bash
cd release
wine "Sanago-0.0.1-setup.exe"
```

This will start the installation wizard. After installation, you can run the application from your desktop shortcut or:

```bash
wine "C:\Program Files\Sanago\sanago.exe"
```

## Troubleshooting

### Wine Errors:

- If you get errors about missing DLL files, try installing the required components using Winetricks:

```bash
sudo apt install winetricks
winetricks corefonts vcrun2019
```

### Build Issues:

- Make sure you're using the latest version of electron-builder
- Check that all build dependencies are installed
- Verify that your package.json configuration is correct

### Performance:

- For better performance, consider using Wine Staging or Proton from Steam
- Adjust Wine settings using `winecfg`
