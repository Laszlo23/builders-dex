# Test Scenario: Assets 404 + Chunk Recovery

## Pre-conditions
1. Production build deployed
2. Browser has cached references to old chunk hashes

## Test Cases

### 1. Missing Asset Returns 404 (not HTML)
```bash
# Before fix: Returns 200 with index.html
# After fix: Returns 404 JSON
curl -sI https://dex.buildingcultureid.space/assets/MISSING-CHUNK-abc123.js
# Expected: HTTP/1.1 404 Not Found
# Expected: content-type: application/json

# Verify body
curl -s https://dex.buildingcultureid.space/assets/MISSING-CHUNK-abc123.js
# Expected: {"error":"Asset not found"}
```

### 2. Real Assets Still Work
```bash
curl -sI https://dex.buildingcultureid.space/assets/index-*.css
# Expected: HTTP/1.1 200 OK
# Expected: cache-control: public, max-age=31536000, immutable
```

### 3. SPA Routes Still Work
```bash
curl -sI https://dex.buildingcultureid.space/
# Expected: HTTP/1.1 200 OK
# Expected: content-type: text/html
# Expected: cache-control: no-cache

curl -sI https://dex.buildingcultureid.space/apply
# Expected: HTTP/1.1 200 OK (serves index.html)
```

### 4. Chunk Error Recovery (Browser Test)
1. Open DevTools → Network → Throttle to "Slow 3G"
2. Clear cache and hard reload
3. Navigate to `/apply` or another lazy route
4. **Expected behavior:**
   - If chunk fails: auto-retry up to 3 times
   - If HTML returned as JS: detected via error message patterns
   - If retries exhausted: auto-reload once per session (sessionStorage flag)
   - If still fails: show UI with "Retry" and "Hard Reload" buttons

### 5. First-Load Experience
1. Open site in incognito
2. Click "Launch Application"
3. **Expected:** No "Loading Error", smooth navigation
4. If error appears: auto-recovers via reload (once)
5. Manual "Hard Reload" button available as fallback

## Success Criteria
- ✅ Missing assets return 404, not 200+HTML
- ✅ Real assets cached immutable (1 year)
- ✅ HTML always fresh (no-cache)
- ✅ Chunk errors auto-recover
- ✅ No infinite reload loops
- ✅ Build passes: `npm run build`
