# Dokploy Persistent Media Setup

This document explains how to set up persistent media storage for your FLY-pg application using Dokploy.

## Changes Made

### 1. Media Collection Configuration
- **Regular Media**: Now stores files in `/app/media/public/` (persistent volume)
- **Support Media**: Now stores files in `/app/media/support/` (persistent volume)

### 2. Docker Configuration
- Updated `Dockerfile` to create media directories with proper permissions
- Directories are owned by the `nextjs` user for security

### 3. Migration Script
- Created `scripts/migrate-media.js` to move existing media files
- Added `npm run migrate:media` command to package.json

## Dokploy Setup Instructions

### Step 1: Add Persistent Volume
1. Go to your Dokploy dashboard
2. Navigate to your FLY-pg project
3. Go to **Volumes** section
4. Add a new persistent volume:
   - **Volume Name**: `media-storage`
   - **Mount Path**: `/app/media`
   - **Volume Type**: `Persistent Volume`
   - **Size**: Set appropriate size (e.g., 10GB or more depending on your media needs)

### Step 2: Migrate Existing Media (Before Deployment)
Manually copy your existing media files to the new structure:

```bash
# Create the media directory structure
mkdir -p media/public media/support

# Copy existing public media files
cp -r src/public/media/* media/public/ 2>/dev/null || true

# Copy existing support media files (if they exist)
cp -r media/support/* media/support/ 2>/dev/null || true
```

This will:
- Copy files from `src/public/media/` to `media/public/`
- Copy files from `media/support/` to `media/support/` (if they exist)
- Create the proper directory structure

### Step 3: Deploy to Dokploy
1. Commit and push your changes
2. Deploy your application through Dokploy
3. The persistent volume will be mounted at `/app/media`

### Step 4: Verify Setup
After deployment:
1. Check that media files are accessible in your application
2. Upload a new media file through the admin panel
3. Verify it persists after a container restart

## Directory Structure

```
/app/
├── media/                    # Persistent volume mount point
│   ├── public/              # Regular media files
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── ...
│   └── support/             # Support media files
│       ├── support1.jpg
│       ├── support2.pdf
│       └── ...
├── public/                  # Static assets (copied during build)
└── ...
```

## Benefits

- ✅ **Persistent Storage**: Media files survive deployments and container restarts
- ✅ **Scalable**: Can handle large amounts of media
- ✅ **Organized**: Clear separation between regular and support media
- ✅ **Secure**: Proper file permissions and user ownership
- ✅ **Dokploy Native**: Uses Dokploy's built-in volume management

## Troubleshooting

### Media Files Not Accessible
1. Check that the persistent volume is properly mounted
2. Verify file permissions in the container
3. Check Payload CMS logs for upload errors

### Permission Issues
If you encounter permission issues, you can fix them by running:
```bash
# In the Dokploy container terminal
sudo chown -R nextjs:nodejs /app/media
sudo chmod -R 755 /app/media
```

### Volume Not Mounting
1. Verify the volume configuration in Dokploy
2. Check that the mount path is exactly `/app/media`
3. Ensure the volume has sufficient space

## Backup Recommendations

Consider setting up regular backups of your persistent volume:
1. Use Dokploy's backup features if available
2. Or set up automated backups to cloud storage
3. Test restore procedures regularly
