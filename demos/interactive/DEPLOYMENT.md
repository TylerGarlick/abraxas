# 🚀 Deployment Instructions

## Quick Deploy Options

### Option 1: Vercel (Recommended)

```bash
cd /tmp/abraxas-checkout/demos/interactive

# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel --prod
```

**What happens:**
- Vercel detects `vercel.json` and configures the Node.js server
- Your demo is live at `https://your-project.vercel.app`
- Automatic HTTPS and global CDN

### Option 2: Hugging Face Spaces

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Choose **Docker** as the SDK
4. Set visibility (Public/Private)
5. Create the space

Then push these files:

```bash
cd /tmp/abraxas-checkout/demos/interactive
git init
git add .
git commit -m "Initial commit: Abraxas Interactive Demo"
git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/abraxas-demo
git push -u origin main
```

The Dockerfile will automatically build and deploy.

### Option 3: Docker (Any Platform)

```bash
cd /tmp/abraxas-checkout/demos/interactive

# Build image
docker build -t abraxas-demo .

# Run locally
docker run -p 3000:3000 abraxas-demo

# Push to registry (optional)
docker tag abraxas-demo your-registry/abraxas-demo:latest
docker push your-registry/abraxas-demo:latest
```

**Deploy to:**
- **Railway:** `railway up` (auto-detects Dockerfile)
- **Render:** Connect GitHub repo, select Docker environment
- **Fly.io:** `flyctl launch --docker`

### Option 4: Manual Server

```bash
cd /tmp/abraxas-checkout/demos/interactive

# Install dependencies
npm install

# Start server
node server.js

# Access at http://localhost:3000
```

For production, use a process manager:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name abraxas-demo

# Save PM2 config
pm2 save
pm2 startup
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |

---

## Post-Deployment Checklist

- [ ] Demo loads at your deployed URL
- [ ] Test cases button works
- [ ] Claim verification returns results
- [ ] Epistemic labels display correctly
- [ ] Pipeline animation works
- [ ] Comparison matrix loads
- [ ] Mobile responsive (test on phone)

---

## Troubleshooting

### Server won't start

```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 node server.js
```

### API endpoints return 404

Check that `server.js` is running and routes are registered:

```bash
curl http://localhost:3000/api/test-cases
```

---

## Cost Estimates

| Platform | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Vercel | ✅ Yes (100GB/mo) | $20/mo |
| Hugging Face | ✅ Yes (CPU) | $7/mo (GPU) |
| Railway | ❌ Trial only | $5/mo |
| Render | ✅ Yes (750hrs/mo) | $7/mo |
| Fly.io | ✅ Yes (shared CPU) | $5/mo |

**Recommendation:** Start with Vercel (free tier is generous) or Hugging Face Spaces (completely free for CPU demos).

---

## Custom Domain

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown

### Hugging Face
1. Go to Space Settings → Custom Domain
2. Add your domain
3. Configure DNS

---

## Monitoring

### Health Check Endpoint

```bash
curl http://your-deployment.com/api/test-cases
```

Expected response: Array of test cases

### Logs

- **Vercel:** `vercel logs <deployment-url>`
- **Hugging Face:** Space page → Logs tab
- **Docker:** `docker logs <container-id>`
- **PM2:** `pm2 logs abraxas-demo`

---

## Next Steps

After deployment:

1. Share the URL with T for review
2. Capture screenshots/screen recording
3. Test with real logos-math test cases
4. Document any issues in the main repo

---

**Demo URL:** _[Fill in after deployment]_  
**Deployed:** _[Date]_  
**Version:** 1.0.0
