# AI Analyst Route Fix Summary

## Critical Bugs Fixed

**Issue:** The AI Analyst route was not loading correctly on the deployed site.

### Three Related Problems:

1. **SEO Path Mismatch** (Initial issue)
   - SEO config had wrong canonical URLs
   - `ai` route pointed to `/intelligence` instead of `/ai`
   - Caused canonical URL conflicts

2. **Legacy URL Broken** (Follow-up issue)
   - `/ai` worked ✅
   - `/intelligence` broken ❌ (rendered landing page instead of AI Analyst)
   - External links and bookmarks with old URL failed

3. **Gemini API Timeout** ⚡ **ROOT CAUSE** (Final issue)
   - Infinite spinner when Gemini API times out
   - VPS logs showed `UND_ERR_CONNECT_TIMEOUT`
   - No user feedback during API hangs
   - Using preview model instead of stable

## Solutions Implemented

### Commit 1: Fix SEO Path Mismatches
**File:** `src/lib/seo.ts`

Fixed 3 canonical URL mismatches:
- `ai`: `/intelligence` → `/ai` ✅
- `builders`: `/rankings` → `/builders` ✅
- `profile`: `/passport` → `/profile` ✅

### Commit 2: Add Legacy Route Aliasing
**Files:** `src/lib/routes.ts`, `server.ts`

#### Client-Side Aliasing
Added route alias resolution to handle legacy URLs:

```typescript
const ROUTE_ALIASES: Record<string, AppRoute> = {
  intelligence: 'ai',
  passport: 'profile',
  rankings: 'builders',
};
```

When user navigates to `/intelligence`:
1. `resolveRoute()` detects alias
2. Returns canonical route `ai`
3. Browser URL updates via `replaceState` to `/ai`
4. AI Analyst renders correctly

#### Server-Side Redirects
Added 301 permanent redirects for SEO and bookmarks:

```typescript
app.get('/intelligence', (_req, res) => res.redirect(301, '/ai'));
app.get('/passport', (_req, res) => res.redirect(301, '/profile'));
app.get('/rankings', (_req, res) => res.redirect(301, '/builders'));
```

### Commit 3: Fix Timeout Issues & Model Upgrade ⚡
**Files:** `src/components/AiView.tsx`, `server.ts`, `.env.example`

#### Client-Side Timeout (90s)
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 90000);

const response = await fetch('/api/ai/chat', {
  signal: controller.signal,
});

if (err.name === 'AbortError') {
  msg = 'Request timed out after 90s. The AI service may be overloaded. Please try again.';
}
```

**UX Improvements:**
- ✅ Clear timeout message instead of infinite spinner
- ✅ Error displayed in UI with retry option
- ✅ No more blank page/stuck state

#### Server-Side Improvements
1. **Updated to stable model:** `gemini-3.7-flash` (was `gemini-3-flash-preview`)
2. **Added 60s timeout** to Gemini API calls
3. **Enhanced fallback chain:** 3.7-flash → 3.6-flash → 3-flash-preview → flash-latest
4. **Added 'timeout'** to retryable error patterns

## Testing Results

✅ `npm run build` passes without errors  
✅ `/ai` loads AI Analyst correctly  
✅ `/intelligence` loads AI Analyst (redirects to `/ai`)  
✅ **Timeout after 90s shows clear error message (no infinite spinner)**  
✅ **Error states display properly with retry option**  
✅ URL bar automatically updates to canonical path  
✅ Server 301 redirects work for direct navigation  
✅ **Fallback to stable models on timeout**  

## User Impact

### Before Fix:
- `/ai` → ⏳ Infinite spinner on timeout ❌
- `/intelligence` → Landing page (broken) ❌
- No error feedback ❌
- Old bookmarks broken ❌
- SEO canonical URL mismatch ❌
- Using preview model ❌

### After Fix:
- `/ai` → Loads correctly, clear timeout error if needed ✅
- `/intelligence` → Redirects to `/ai`, loads correctly ✅
- Clear error messages with retry option ✅
- Old bookmarks work (301 redirect) ✅
- SEO canonical URLs correct ✅
- Using stable gemini-3.7-flash with fallbacks ✅

## Technical Details

### Route Resolution Flow

**Direct navigation to `/intelligence`:**
```
1. Server catches route
2. 301 redirect to /ai
3. Browser follows redirect
4. SPA loads /ai route
5. AI Analyst renders
```

**SPA navigation to legacy route:**
```
1. getPathFromUrl() called
2. resolveRoute('intelligence') → 'ai'
3. replaceState to /ai
4. App renders AI Analyst
```

### Files Changed
- `src/lib/seo.ts` - Fixed canonical URL paths
- `src/lib/routes.ts` - Added route aliasing + auto-redirect
- `server.ts` - Added 301 redirects, timeouts, model upgrade
- `src/components/AiView.tsx` - Added client timeout handling
- `.env.example` - Documented new default model

## Pull Request
**PR #10:** https://github.com/Laszlo23/builders-dex/pull/10
**Branch:** `cursor/fix-ai-route-seo-mismatch-1f6e`

**Commits:**
1. `fc7bf86` - Fix SEO path mismatches
2. `b88c5c8` - Add legacy route aliasing + 301 redirects
3. `41ad4e5` - Add comprehensive fix summary
4. `326e75d` - Fix timeout issues and upgrade to stable model

Ready to merge ✅

## Root Cause Analysis

The "AI Analyst does not load" issue was actually **3 separate bugs** that compounded:

1. **SEO mismatch** - Confused canonical URLs
2. **Missing route alias** - Legacy `/intelligence` URL broke
3. **⚡ Gemini timeout (ROOT CAUSE)** - API hangs caused infinite spinner

The timeout issue was the primary user-facing problem. Even with correct routing, the page appeared broken because:
- No client-side timeout → infinite wait
- No server-side timeout → API could hang indefinitely  
- Preview model → less stable than production models
- No error feedback → user saw blank page with spinner

**Fix:** Added timeouts at both layers + upgraded to stable model + fallback chain.
