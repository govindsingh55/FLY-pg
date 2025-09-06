# Live Preview Setup Guide

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```env
# Site URL for live preview
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Secret key for draft previews (generate a random string)
PREVIEW_SECRET=your-secret-key-here
```

## Steps to Enable Live Preview

1. **Add Environment Variables**: Add the variables above to your `.env.local` file
2. **Restart Development Server**: Stop and restart your Next.js development server
3. **Clear Browser Cache**: Clear your browser cache or use incognito mode
4. **Check PayloadCMS Admin**: Navigate to the Pages collection and create/edit a page

## Troubleshooting

### Live Preview Icon Not Showing

1. **Check Environment Variables**: Visit `/api/test-preview` to verify environment variables are set
2. **Restart Server**: Restart both Next.js and PayloadCMS development servers
3. **Check Console**: Look for any JavaScript errors in browser console
4. **Verify PayloadCMS Version**: Ensure you're using PayloadCMS 3.0 or later

### Preview Not Loading

1. **Check URLs**: Verify the preview URLs are being generated correctly
2. **Network Tab**: Check browser network tab for failed requests
3. **Server Logs**: Check server console for any errors

## Testing

1. **Create a Test Page**: Create a new page with a title and slug
2. **Check Preview Icon**: Look for the preview icon in the admin interface
3. **Test Preview**: Click the preview icon to open the preview panel
4. **Test Responsive**: Switch between Mobile, Tablet, and Desktop views

## Expected Behavior

- **Preview Icon**: Should appear next to the "Save Draft" button
- **Preview Panel**: Should open on the right side with responsive breakpoints
- **Real-time Updates**: Preview should update as you edit fields
- **Draft Notice**: Draft pages should show a "Draft Preview" notice

## Support

If live preview still doesn't work:

1. Check PayloadCMS documentation for version-specific requirements
2. Verify all dependencies are up to date
3. Check for any conflicting configurations
4. Try creating a minimal test collection with live preview
