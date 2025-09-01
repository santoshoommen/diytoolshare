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

#### Essential Variables (Required for basic functionality):

```bash
# Sharetribe Configuration (Client-side)
REACT_APP_SHARETRIBE_SDK_CLIENT_ID=your_client_id
REACT_APP_SHARETRIBE_SDK_BASE_URL=https://flex-api.sharetribe.com
REACT_APP_SHARETRIBE_USING_SSL=true

# Sharetribe Configuration (Server-side)
SHARETRIBE_SDK_CLIENT_SECRET=your_client_secret

# Mapbox Configuration
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# App Configuration (CRITICAL - Required for server to start)
REACT_APP_MARKETPLACE_ROOT_URL=https://your-app-name.onrender.com
REACT_APP_MARKETPLACE_NAME=DIY Tool Share
NODE_ENV=production

# SSL Configuration (CRITICAL - Fixes redirect loop)
SERVER_SHARETRIBE_REDIRECT_SSL=false
SERVER_SHARETRIBE_TRUST_PROXY=true

# Basic Authentication (Optional - for development/staging)
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your_secure_password
```

#### Optional Variables (Set if you need these features):
```bash
# Facebook Login (optional)
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id

# Google Login (optional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Sentry Error Tracking (optional)
REACT_APP_SENTRY_DSN=your_sentry_dsn

# Content Security Policy (optional)
REACT_APP_CSP=your_csp_policy

# Development API Server Port (optional, for local dev)
REACT_APP_DEV_API_SERVER_PORT=3500
```

### Troubleshooting

#### Issue: "expect@30.0.5: The engine 'node' is incompatible"
**Solution**: Ensure Node.js version is set to 22.0.0 in Render.com settings

#### Issue: "sharetribe-scripts: not found"
**Solution**: The build script now includes `yarn install --frozen-lockfile` to ensure all dependencies are installed

#### Issue: "TypeError: Cannot read properties of undefined (reading 'replace')"
**Solution**: Set the `REACT_APP_MARKETPLACE_ROOT_URL` environment variable in Render.com dashboard

#### Issue: "Required environment variable is not set: REACT_APP_MARKETPLACE_NAME"
**Solution**: Set the `REACT_APP_MARKETPLACE_NAME` environment variable in Render.com dashboard (e.g., "DIY Tool Share")

#### Issue: "Too many redirects" error
**Solution**: Set `SERVER_SHARETRIBE_REDIRECT_SSL=false` and `SERVER_SHARETRIBE_TRUST_PROXY=true` in Render.com environment variables

#### Issue: Basic auth not working
**Solution**: Ensure both `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` are set in Render.com environment variables

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

### SSL Redirect Loop Fix

#### Why This Happens:
Render.com handles SSL termination at the load balancer level. When your app tries to redirect HTTP to HTTPS, it creates a redirect loop because:
1. User visits `https://your-app.onrender.com`
2. Render.com load balancer forwards to your app as HTTP
3. Your app sees HTTP and redirects to HTTPS
4. This creates an infinite loop

#### The Fix:
Set these environment variables in Render.com:
```bash
SERVER_SHARETRIBE_REDIRECT_SSL=false
SERVER_SHARETRIBE_TRUST_PROXY=true
```

This tells the app:
- Don't redirect HTTP to HTTPS (Render.com handles this)
- Trust the proxy headers from Render.com's load balancer

### Basic Authentication

#### How It Works:
Sharetribe has built-in basic authentication that automatically activates in production when you set the environment variables:

```bash
BASIC_AUTH_USERNAME=admin
BASIC_AUTH_PASSWORD=your_secure_password
```

#### Features:
- **Automatic activation**: Only works in production (not in development)
- **Bypass static assets**: Static files (CSS, JS, images) are not protected
- **Bypass API endpoints**: API routes are not protected (for Sharetribe backend)
- **Bypass well-known endpoints**: Required for Sharetribe integrations

#### Security:
- **Simple but effective**: Protects your development/staging site
- **Browser prompt**: Users get a standard browser authentication dialog
- **No session management**: Credentials are sent with each request

#### To Disable:
Simply remove the `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` environment variables.

### Monitoring

- Check Render.com logs for any build or runtime errors
- Monitor application performance in Render.com dashboard
- Set up alerts for deployment failures
