# PlaneProtect

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/POIbakri/planeprotect)

## Local Development

### Supabase Edge Functions

The project uses Supabase Edge Functions powered by Deno for backend API functionality.

#### Prerequisites

- Install Deno: https://deno.land/#installation
- Supabase CLI: `npm install -g supabase`

#### Setup Local Environment

1. Set up your environment variables:
   ```bash
   # Navigate to the function directory
   cd supabase/functions/aviation
   
   # Edit the .env file with your actual values
   nano .env
   ```

2. Run a function locally:
   ```bash
   # Option 1: If Deno is in your PATH
   deno task dev
   
   # Option 2: Use the provided script (recommended)
   ./run-local.sh
   ```

3. Deploy a function:
   ```bash
   # Make sure you're logged in to Supabase CLI
   supabase login
   
   # Deploy the function
   supabase functions deploy aviation
   ```

#### Alternative Deno Setup

If running `deno` commands doesn't work, you can fix your PATH by running:

```bash
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then restart your terminal and try again.

#### Testing Edge Functions

When testing locally, the functions will be available at:
- Aviation API: http://localhost:8000/aviation
- Aviation Sync: http://localhost:8000/aviation-sync