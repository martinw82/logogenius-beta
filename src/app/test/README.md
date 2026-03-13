# Image Generation Test

This is a minimal test to verify that Google AI image generation works correctly before integrating with the complex workflows.

## Files

- `/src/app/api/test/logo-generation/route.ts` - API endpoint that generates a simple image
- `/src/app/test/page.tsx` - UI page to trigger the test and view results

## How to Test

### 1. Add your API Key

Make sure your `.env.local` file has a Google AI API key:

```bash
GENKIT_API_KEY=your_key_from_google_ai_studio
```

Get your key from: https://aistudio.google.com/app/apikey

### 2. Start the dev server

```bash
npm run dev
```

### 3. Open the test page

Go to: http://localhost:9002/test

### 4. Click "Generate Image"

This will:
1. Check if the API key is configured
2. Initialize Genkit with the Google AI plugin
3. Call the `gemini-2.0-flash-exp` model with `responseModalities: ["TEXT", "IMAGE"]`
4. Return the generated image URL or detailed error information

## What to Look For

### Success ✅
- The page shows "Success!" with a generated image
- You can see the coffee shop logo (or whatever prompt you used)
- The image URL is displayed

### Failure ❌
- Check the error message
- Look at the browser console for logs
- Check the terminal running `npm run dev` for server-side logs
- The debug info will show exactly what went wrong

## Common Issues

### "No API key found"
- The environment variable isn't set correctly
- Try adding it to `.env.local` and restart the dev server

### "404 Not Found" or "Model not found"
- The model name might be wrong
- Check that we're using `googleai/gemini-2.0-flash-exp`

### "No image generated"
- The API returned a response but no image
- Check the debug info to see the full response structure

### Other errors
- Check the terminal logs for the full stack trace
- The API key might be invalid or expired
- The key might not have image generation permissions

## Next Steps

Once this test works:
1. The model configuration is correct
2. The API key is valid
3. Genkit is properly initialized

Then we can integrate this working configuration back into:
- `/src/ai/flows/generate-logo-concepts.ts`
- `/src/ai/flows/generate-logo-mockups.ts`
- `/src/ai/flows/refine-logo-generation.ts`
