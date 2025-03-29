# RefundHero Deployment Guide

## Prerequisites

- Node.js 18.x or higher
- Supabase account with a project set up
- Resend account for email functionality
- Aviation Stack API key
- Netlify account for hosting

## Environment Variables

Ensure the following environment variables are set:

```env
VITE_AVIATION_STACK_KEY=your_aviation_stack_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RESEND_API_KEY=your_resend_api_key
```

## Database Setup

1. **Initialize Supabase Project**
   - Connect to your Supabase project
   - Run all migrations in `/supabase/migrations` in order
   - Verify all tables are created with proper RLS policies

2. **Verify Database Configuration**
   - Check all tables have RLS enabled
   - Verify indexes are created for performance
   - Ensure email templates are populated
   - Test RLS policies for different user roles

## Build Configuration

The project uses Vite for building. Key configuration files:

- `vite.config.ts` - Main build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

   This creates a `dist` folder with optimized assets.

## Deployment Steps

1. **Pre-deployment Checklist**
   - [ ] All environment variables are set
   - [ ] Database migrations are up to date
   - [ ] Email templates are configured
   - [ ] Build completes successfully
   - [ ] All API endpoints are configured correctly

2. **Deploy to Netlify**
   - Connect your repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Node version: 18.x
   - Add environment variables in Netlify dashboard

3. **Post-deployment Verification**
   - [ ] Test user authentication
   - [ ] Verify email functionality
   - [ ] Check claim submission process
   - [ ] Test admin dashboard
   - [ ] Verify file uploads
   - [ ] Check mobile responsiveness

## Monitoring & Maintenance

1. **Performance Monitoring**
   - Monitor Core Web Vitals
   - Check API response times
   - Monitor database performance
   - Track error rates

2. **Error Tracking**
   - Monitor client-side errors
   - Check server logs
   - Track failed API requests
   - Monitor email delivery status

3. **Database Maintenance**
   - Regular backups
   - Index optimization
   - Query performance monitoring
   - Storage usage tracking

4. **Security**
   - Regular security audits
   - Monitor authentication attempts
   - Check file upload security
   - Review API access patterns

## Rollback Procedure

1. **Identify Issue**
   - Monitor error rates
   - Check user reports
   - Review logs

2. **Quick Fixes**
   - Revert to last working deployment in Netlify
   - Check environment variables
   - Verify database connectivity

3. **Database Rollback**
   - Use Supabase point-in-time recovery if needed
   - Revert problematic migrations
   - Restore from backup if necessary

## Scaling Considerations

1. **Database**
   - Monitor connection pools
   - Optimize queries
   - Consider read replicas for heavy loads

2. **File Storage**
   - Monitor storage usage
   - Implement file cleanup policies
   - Consider CDN for large files

3. **API**
   - Implement rate limiting
   - Cache frequently accessed data
   - Monitor API usage patterns

## Troubleshooting

Common issues and solutions:

1. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Review build logs

2. **Database Issues**
   - Check connection strings
   - Verify RLS policies
   - Monitor query performance

3. **Email Problems**
   - Verify Resend API key
   - Check email templates
   - Monitor email delivery status

4. **File Upload Issues**
   - Check storage permissions
   - Verify file size limits
   - Monitor upload success rates

## Contact & Support

For deployment support:
- Technical issues: dev@refundhero.com
- Database issues: dba@refundhero.com
- Security concerns: security@refundhero.com

## Deployment Checklist

Pre-deployment:
- [ ] Run all tests
- [ ] Check environment variables
- [ ] Verify database migrations
- [ ] Test email templates
- [ ] Review security settings

Post-deployment:
- [ ] Verify site is accessible
- [ ] Test user flows
- [ ] Check admin features
- [ ] Monitor error rates
- [ ] Test email delivery
- [ ] Verify file uploads