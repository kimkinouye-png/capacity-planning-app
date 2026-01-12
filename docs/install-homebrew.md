# Installing Homebrew

Homebrew is a package manager for macOS that makes it easy to install command-line tools.

## Installation

Run this command in your terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

This will:
1. Download the Homebrew installation script
2. Install Homebrew to `/opt/homebrew` (on Apple Silicon) or `/usr/local` (on Intel)
3. Add Homebrew to your PATH

## After Installation

You may need to add Homebrew to your PATH. The installer will tell you if you need to run additional commands. Typically:

**For Apple Silicon Macs (M1/M2/M3):**
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**For Intel Macs:**
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

## Verify Installation

Test that Homebrew is installed correctly:

```bash
brew --version
```

You should see something like: `Homebrew 4.x.x`

## Then Install ngrok

Once Homebrew is installed, you can install ngrok:

```bash
brew install ngrok
```

## Alternative: Install ngrok Without Homebrew

If you prefer not to install Homebrew, you can download ngrok directly:

1. Go to https://ngrok.com/download
2. Download the macOS version
3. Unzip the file
4. Move `ngrok` to a location in your PATH (e.g., `/usr/local/bin/`)
5. Or run it directly from the download location
