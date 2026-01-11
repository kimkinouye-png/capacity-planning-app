# Capacity Planning App

## Deployment

### Netlify Deployment

To deploy this Vite app to Netlify:

1. **Connect GitHub repo to Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Add new site from Git
   - Connect your GitHub repository

2. **Configure build settings**
   - **Branch**: Use `main` branch
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Deploy**
   - Netlify will automatically build and deploy on every push to `main`
   - The build process runs `npm run build` which executes `tsc && vite build`
   - Built files are published from the `dist` directory

The `netlify.toml` file in the project root contains the build configuration:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```
