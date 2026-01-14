#!/bin/bash

# Configuration
# You can override these with environment variables or a .env file
DEST_HOST="${DEPLOY_DESTINATION_HOST}"
DEST_PATH="${DEPLOY_DESTINATION_PATH}"
BUILD_DIR="apps/calculators/dist"

echo "🚀 Starting Deployment to $DEST_HOST..."

# 1. Build the project
echo "📦 Building project..."
npm run build --workspace=calculators

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# 2. Deploy (Using rsync or scp would be ideal for generic Linux, but for WebDAV/SMB mapping on Linux, we might need davfs2 or smbclient)
# Assuming the user might want a simple copy if mounted, or we warn them.
# For this script, we'll assume a standard SCP/Rsync workflow for Linux servers, 
# OR check if the DEST_PATH is a mounted directory.

if [ -d "$DEST_PATH" ]; then
    echo "📂 Destination is a local/mounted directory. Copying files..."
    cp -r "$BUILD_DIR/"* "$DEST_PATH/"
    echo "✅ Files copied successfully."
else
    echo "⚠️  Destination path '$DEST_PATH' is not accessible directly."
    echo "ℹ️  If you are deploying to a remote server, please configure SSH/SCP/Rsync."
    echo "ℹ️  Example: scp -r $BUILD_DIR/* user@host:/var/www/html/calculators"
    
    # Attempting to use smbclient if it looks like a UNC path (converted to smb:// for Linux tool compatibility?)
    # But since the user specifically asked for a Linux/MacOS script equivalent to the Windows one,
    # and the Windows one acts on a UNC path likely mapped via WebDAV, we should provide instructions or a generic copy.
    
    echo "❌ Deployment stopped. Please ensure the destination is mounted or accessible."
    exit 1
fi

echo "🎉 Deployment Complete!"
