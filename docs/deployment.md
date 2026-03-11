# LogoGenius Deployment Guide

## Overview

This guide covers production deployment of LogoGenius for Vercel, self-hosted, and cloud environments. All deployment options require MySQL database, API keys for AI services, and environment variable configuration.

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript compilation passes (`npm run build`)
- [ ] No console.log statements in production code
- [ ] All error handling implemented
- [ ] CORS properly configured
- [ ] Rate limiting in place
- [ ] Input validation on all endpoints
- [ ] Database connection pooling configured

### Testing
- [ ] Unit tests passing (if applicable)
- [ ] Integration tests passing
- [ ] E2E tests passing for all tiers
- [ ] Manual testing on staging environment
- [ ] Performance tests completed
- [ ] Load testing (5+ concurrent requests)
- [ ] Device testing (mobile, tablet, desktop)

### Security
- [ ] Environment variables not committed to git
- [ ] Admin password hashed and not in config
- [ ] JWT secrets rotated
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled on production
- [ ] CORS origins whitelist reviewed
- [ ] File upload validation implemented
- [ ] Rate limiting on API endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection verified

### Database
- [ ] MySQL 5.7+ installed and running
- [ ] Database schema migrated (see schema.sql)
- [ ] Admin user created
- [ ] Backup strategy in place
- [ ] Connection pooling configured
- [ ] Database indexes created
- [ ] Regular backups scheduled

### Environment
- [ ] Node.js 18+ installed
- [ ] npm or yarn available
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables set
- [ ] API keys configured
- [ ] File storage directory writable
- [ ] Temp directory accessible

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/logogenius

# Admin Authentication
ADMIN_PASSWORD=<secure-password-here>
JWT_SECRET=<random-secure-string>

# AI Generation (Google Genkit)
GENKIT_API_KEY=<your-genkit-api-key>
GENKIT_MODEL=<model-name>

# Figma Integration
FIGMA_API_TOKEN=<your-figma-api-token>

# Canva Integration
CANVA_API_KEY=<your-canva-api-key>
CANVA_TEAM_ID=<your-canva-team-id>

# File Storage
FILE_STORAGE_PATH=/var/logogenius/storage

# Email Service (Optional)
EMAIL_SERVICE=sendgrid|mailgun
EMAIL_API_KEY=<email-service-api-key>
EMAIL_FROM=noreply@logogenius.com

# Application
NODE_ENV=production
APP_URL=https://logogenius.yourdomain.com
```

### Optional Variables

```bash
# Monitoring & Analytics
SENTRY_DSN=<your-sentry-dsn>
DATADOG_API_KEY=<your-datadog-api-key>

# File Upload Limits
MAX_UPLOAD_SIZE=52428800 # 50MB

# Rate Limiting
RATE_LIMIT_WINDOW=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Performance
LOGO_GENERATION_TIMEOUT=30000 # 30 seconds
PDF_GENERATION_TIMEOUT=60000 # 60 seconds
```

## Vercel Deployment

### Step 1: Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Connect repository
vercel
```

### Step 2: Configure Environment Variables

```bash
# Set in Vercel dashboard or via CLI
vercel env add DATABASE_URL
vercel env add ADMIN_PASSWORD
vercel env add JWT_SECRET
vercel env add GENKIT_API_KEY
# ... add remaining variables
```

### Step 3: Configure Build Settings

In `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Step 4: Deploy

```bash
vercel --prod
```

### Step 5: Verify Deployment

```bash
# Check deployment status
vercel list

# View logs
vercel logs

# Run health check
curl https://logogenius.yourdomain.com/api/health
```

## Self-Hosted Deployment (Docker)

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/logogenius
      - NODE_ENV=production
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - GENKIT_API_KEY=${GENKIT_API_KEY}
    depends_on:
      - db
    volumes:
      - ./storage:/app/storage

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: logogenius
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

### Step 3: Deploy

```bash
# Create .env file with variables
cp .env.example .env
# Edit .env with actual values

# Start services
docker-compose up -d

# Verify deployment
curl http://localhost:3000/api/health
```

## AWS Deployment (EC2)

### Step 1: Launch EC2 Instance

- **AMI:** Ubuntu 22.04 LTS
- **Instance Type:** t3.medium (2 vCPU, 4GB RAM) minimum
- **Storage:** 50GB (gp3)
- **Security Group:** Allow ports 80, 443, 22

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

### Step 3: Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/logogenius
sudo chown ubuntu:ubuntu /var/www/logogenius

# Clone repository
cd /var/www/logogenius
git clone https://github.com/yourusername/logogenius-beta.git .
```

### Step 4: Configure Application

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with actual values

# Build application
npm run build

# Create storage directory
mkdir -p storage
chmod 755 storage
```

### Step 5: Configure Nginx

```nginx
# /etc/nginx/sites-available/logogenius
server {
    listen 80;
    server_name logogenius.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/logogenius /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Setup SSL

```bash
sudo certbot --nginx -d logogenius.yourdomain.com
```

### Step 7: Configure Systemd Service

```ini
# /etc/systemd/system/logogenius.service
[Unit]
Description=LogoGenius Application
After=network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/logogenius
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

Environment="NODE_ENV=production"
EnvironmentFile=/var/www/logogenius/.env

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable logogenius
sudo systemctl start logogenius
```

## Post-Deployment Verification

### Health Checks

```bash
# API health check
curl https://logogenius.yourdomain.com/api/health

# Admin login test
curl -X POST https://logogenius.yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"$ADMIN_PASSWORD"}'

# Database connectivity
curl https://logogenius.yourdomain.com/api/admin/orders
```

### Performance Testing

```bash
# Load testing with ab (Apache Bench)
ab -n 100 -c 10 https://logogenius.yourdomain.com/

# Or with wrk
wrk -t4 -c100 -d30s https://logogenius.yourdomain.com/
```

### Security Verification

```bash
# Check SSL certificate
openssl s_client -connect logogenius.yourdomain.com:443

# Check security headers
curl -I https://logogenius.yourdomain.com | grep -E "Strict-Transport|X-Content"

# Run OWASP scan (if available)
zaproxy -cmd -quickurl https://logogenius.yourdomain.com -quickout report.html
```

## Monitoring & Maintenance

### Logging

```bash
# Application logs (Vercel)
vercel logs

# Container logs (Docker)
docker-compose logs -f app

# Systemd logs (EC2)
journalctl -u logogenius -f
```

### Backup Strategy

```bash
# Daily MySQL backup
0 2 * * * mysqldump -u root -p$MYSQL_ROOT_PASSWORD logogenius > /backups/logogenius-$(date +\%Y\%m\%d).sql

# Upload to S3
0 3 * * * aws s3 cp /backups/ s3://logogenius-backups/ --recursive
```

### Database Maintenance

```sql
-- Optimize tables weekly
OPTIMIZE TABLE orders, order_details, logo_variants, brand_archetypes, admin_sessions;

-- Check database integrity
CHECK TABLE orders, order_details, logo_variants;
```

### Performance Monitoring

```bash
# Monitor API response times
curl -w "@curl-format.txt" https://logogenius.yourdomain.com/api/health

# Monitor CPU/Memory usage
top # or htop
free -h
df -h /var/www/logogenius

# Monitor database connections
mysql -e "SHOW PROCESSLIST;"
```

## Troubleshooting

### Common Issues

**Issue:** "Cannot find module '.prisma/client'"
- **Solution:** Run `npx prisma generate` before deployment

**Issue:** Database connection timeout
- **Solution:** Check DATABASE_URL format, verify MySQL is running, check firewall rules

**Issue:** Logo generation timeout
- **Solution:** Increase LOGO_GENERATION_TIMEOUT, check Genkit API quota

**Issue:** Disk space full**
- **Solution:** Implement cleanup of old generated files, increase storage allocation

**Issue:** High memory usage
- **Solution:** Implement connection pooling, increase PM2 max_memory_restart

## Rollback Procedure

### Vercel Rollback

```bash
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Docker Rollback

```bash
# Stop current version
docker-compose down

# Pull previous version
git checkout <previous-commit>

# Restart
docker-compose up -d
```

### EC2 Rollback

```bash
# Stop service
sudo systemctl stop logogenius

# Restore from git
git checkout <previous-commit>

# Rebuild and restart
npm run build
sudo systemctl start logogenius
```

## Disaster Recovery

### Database Recovery

```bash
# Restore from backup
mysql logogenius < /backups/logogenius-backup.sql

# Or from S3
aws s3 cp s3://logogenius-backups/logogenius-latest.sql - | mysql logogenius
```

### Application Recovery

```bash
# Restore from version control
git clone https://github.com/yourusername/logogenius-beta.git /var/www/logogenius-recovery
cd /var/www/logogenius-recovery
npm install
npm run build
```

## Maintenance Windows

Scheduled maintenance every Sunday 2:00-3:00 AM UTC:
- Database optimization
- Security updates
- Performance monitoring
- Backup verification

## Support & Monitoring

- **Status Page:** https://status.logogenius.com
- **Monitoring Dashboard:** Datadog/New Relic
- **Alert Email:** ops@logogenius.com
- **On-Call Rotation:** Contact engineering team

---

**Version:** 1.0
**Last Updated:** 2026-03-11
**Next Review:** 2026-06-11
