# Supabase Database Migration Guide

This guide helps you rebuild the Supabase database for this project in your own Supabase account, since the old database belongs to the previous owner and you do not have access to it.

---

## 1. Create a New Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or sign up).
2. Click **"New Project"**.
3. Choose your organization, give the project a name (e.g., `watanare-reader`), and set a strong database password. **Save this password** — you will need it if you ever connect directly via pgAdmin or psql.
4. Wait for the project to be provisioned (usually takes 1–2 minutes).

---

## 2. Run the Database Schema Script

1. In your new Supabase project dashboard, go to the **SQL Editor** (left sidebar).
2. Click **"New query"**.
3. Open the file `supabase-schema.sql` from this repo and **copy its entire contents** into the SQL Editor.
4. Click **"Run"**.

This creates all the tables, RLS policies, realtime publications, triggers, and the `delete_user` RPC function required by the app.

### What the script creates:

| Table                | Purpose                                               |
|----------------------|-------------------------------------------------------|
| `profiles`           | Public username & avatar for each authenticated user  |
| `guestbook`          | Anonymous guestbook entries                           |
| `comments`           | Nested chapter comments (with parent_id for replies)  |
| `comment_reactions`  | Upvotes/downvotes on comments                         |
| `reading_progress`   | Last-read chapter & scroll position per volume        |

It also:
- Enables Row Level Security (RLS) on all tables
- Creates a trigger that auto-creates a `profiles` row whenever a new user signs up
- Sets up Realtime subscriptions so the comment panel updates live

---

## 3. Configure Authentication Providers

Go to **Authentication > Providers** in the Supabase Dashboard and set up the following:

### Email Provider (enabled by default)
- It is already on. You can choose whether to require email confirmation.
- If you disable "Confirm email", users can sign in immediately after registration.
- If you keep it enabled, users must click a link in their email before logging in.

### Google OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or use an existing one).
3. Navigate to **APIs & Services > Credentials**.
4. Click **"Create Credentials" > "OAuth client ID"**.
5. Configure the consent screen if prompted.
6. Application type: **Web application**.
7. Add an Authorized redirect URI:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   - Replace `<your-project-ref>` with your actual Supabase project reference (found in Settings > API).
8. Copy the **Client ID** and **Client Secret** into the Supabase Dashboard under the Google provider.

### GitHub OAuth
1. Go to **GitHub > Settings > Developer settings > OAuth Apps**.
2. Click **"New OAuth App"**.
3. Fill in:
   - **Application name**: Watanare Reader
   - **Homepage URL**: `https://your-domain.com` (or `http://localhost:3000` for local dev)
   - **Authorization callback URL**:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. Click **"Register application"**.
5. Copy the **Client ID** and generate a **Client Secret**, then paste both into the Supabase Dashboard under the GitHub provider.

---

## 4. Create the "avatars" Storage Bucket

The app allows users to upload profile pictures. You must create the storage bucket manually:

1. In the Supabase Dashboard, go to **Storage** (left sidebar).
2. Click **"New bucket"**.
3. Name it exactly: `avatars`
4. Toggle **Public bucket** to ON (the app calls `getPublicUrl()` which requires public access).
5. Click **"Save"**.
6. After creating the bucket, go to its **Policies** tab and add the following:

| Policy Name                 | Allowed Operation | Target Role | Policy Definition                                      |
|-----------------------------|-------------------|-------------|--------------------------------------------------------|
| Allow public reads          | SELECT            | anon        | `bucket_id = 'avatars'`                                |
| Allow authenticated uploads | INSERT            | authenticated | `bucket_id = 'avatars'`                              |
| Allow authenticated updates | UPDATE            | authenticated | `bucket_id = 'avatars' AND owner = auth.uid()`         |
| Allow authenticated deletes | DELETE            | authenticated | `bucket_id = 'avatars' AND owner = auth.uid()`         |

---

## 5. Configure Redirect URLs

1. Go to **Authentication > URL Configuration**.
2. Set:
   - **Site URL**: Your production domain, e.g. `https://watanare-reader.pages.dev`
   - (Optional) Add `http://localhost:3000` to **Redirect URLs** for local development.

---

## 6. Update Your Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Fill in the values from your new Supabase project:
   - Go to **Project Settings > API**.
   - Copy **"URL"** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **"anon public"** key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh12345678.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 7. Rebuild and Deploy

After updating `.env.local`, rebuild the project:

```bash
npm run build
```

If you are deploying to Cloudflare Pages (as configured by `wrangler.toml`), make sure to add the environment variables in the Cloudflare Pages dashboard under **Settings > Environment variables** as well, so the build process has access to them.

---

## 8. Test Everything

| Feature           | How to Test                                                                   |
|-------------------|-------------------------------------------------------------------------------|
| Sign Up / Sign In | Use the auth modal. Try both Email and OAuth (Google/GitHub).                |
| Guestbook         | Post an anonymous entry on the `/guestbook` page or via the floating button. |
| Comments          | Open a chapter, open the comments panel, post a comment and a reply.         |
| Reactions         | Upvote/downvote a comment.                                                    |
| Profile           | Upload an avatar, change display name, update password.                      |
| Reading Progress  | Read a chapter, navigate away, then check the "Continue reading" pill.       |
| Account Deletion  | In Profile Settings > Danger Zone, attempt to delete account.               |

---

## Troubleshooting

### "Failed to load entries" on Guestbook
- Check that the `guestbook` table exists in the Table Editor.
- Verify RLS is enabled and the INSERT policy allows anonymous inserts.

### Comments do not appear or do not update live
- Ensure the `supabase_realtime` publication was created (check in the SQL Editor with `SELECT * FROM pg_publication;`).
- Make sure the `comments` and `comment_reactions` tables are included in the publication.

### Avatar upload fails
- Verify the `avatars` bucket exists and is set to Public.
- Check that the INSERT policy on the `avatars` bucket allows authenticated users.

### "The deletion feature hasn't been enabled on the database yet"
- The `delete_user()` RPC function exists in the schema script, but it does NOT delete the `auth.users` row directly (that requires admin/service-role privileges).
- For full account deletion, you should either:
  1. Delete the user manually from **Authentication > Users** in the Supabase Dashboard, OR
  2. Create a Supabase Edge Function that runs with service-role to delete the auth user.

---

## Data You Cannot Migrate

Because you do not have access to the old Supabase project, the following data from the old database **cannot be recovered**:

- Existing user accounts (users must re-register)
- Existing guestbook entries
- Existing chapter comments and reactions
- Existing reading progress

You are essentially starting fresh, which is expected when the old database is inaccessible.

---

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
