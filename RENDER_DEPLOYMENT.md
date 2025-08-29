# Render.com Deployment Guide

## 🚀 Deployment Configuration

### Node.js Version
- **Required**: Node.js 22.0.0 (LTS)
- **Reason**: Compatibility with `expect` package and other dependencies

### Build Configuration

#### Option 1: Using .render.yaml (Recommended)
The `.render.yaml` file is already configured with:
- Node.js 22.0.0
- Proper build commands
- Environment variables

#### Option 2: Manual Configuration in Render Dashboard

**Build Command:**
```bash
cd apps/marketplace && yarn install --frozen-lockfile && yarn build
```

**Start Command:**
```bash
cd apps/marketplace && yarn start
```

**Environment Variables:**
- `NODE_ENV`: `production`
- `NODE_VERSION`: `22.0.0`

### Required Environment Variables

Make sure to set these in your Render.com dashboard:

```bash
# Sharetribe Configuration (Client-side)
REACT_APP_SHARETRIBE_SDK_CLIENT_ID=your_client_id
REACT_APP_SHARETRIBE_SDK_BASE_URL=https://flex-api.sharetribe.com
REACT_APP_SHARETRIBE_USING_SSL=true

# Sharetribe Configuration (Server-side)
SHARETRIBE_SDK_CLIENT_SECRET=your_client_secret

# Mapbox Configuration
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# App Configuration
REACT_APP_MARKETPLACE_ROOT_URL=https://your-app-name.onrender.com
NODE_ENV=production
```

### Troubleshooting

#### Issue: "expect@30.0.5: The engine 'node' is incompatible"
**Solution**: Ensure Node.js version is set to 22.0.0 in Render.com settings

#### Issue: "sharetribe-scripts: not found"
**Solution**: The build script now includes `yarn install --frozen-lockfile` to ensure all dependencies are installed

#### Issue: Build fails with dependency errors
**Solution**: 
1. Clear Render.com cache
2. Ensure `yarn.lock` is committed to repository
3. Use `--frozen-lockfile` flag for consistent installations

### Build Process

1. **Install Dependencies**: `yarn install --frozen-lockfile`
2. **Build Web Assets**: `yarn build-web`
3. **Build Server**: `yarn build-server`
4. **Start Application**: `yarn start`

### Health Check

The application includes a health check endpoint at `/` that Render.com will use to verify the deployment is successful.

### Monitoring

- Check Render.com logs for any build or runtime errors
- Monitor application performance in Render.com dashboard
- Set up alerts for deployment failures
