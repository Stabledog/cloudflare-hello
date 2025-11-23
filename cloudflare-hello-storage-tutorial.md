# Cloudflare Workers Hello-World Tutorial  
This single-file guide walks you through creating a trivial Cloudflare Workers project that:
- Responds to HTTP requests
- Uses **KV**, **R2**, and **D1** storage
- Lets you test via browser or command line
- Stays extremely simple

You can drop this file into VS Code and work through it step‑by‑step.

**Requirements**: Node.js 16.13+ (tested with Node 22), Wrangler 4.50.0+

---

# 1. Install prerequisites

### Install `wrangler` (Cloudflare CLI)
```
npm install -g wrangler
```

**Note**: With Wrangler 4.x, global install works well. You can also use `npx wrangler` if you prefer project-local installs.

### Log in
```
wrangler login
```

---

# 2. Create the project
```
wrangler init cf-storage-demo
```

When prompted (Wrangler 4.50.0):
- Choose "Hello World Worker" template
- Say **yes** or **no** to TypeScript (this guide uses JavaScript)
- Say **yes** to Git repository if asked
- Say **yes** to deploying (or skip for now)

```
cd cf-storage-demo
```

The project structure will have `src/index.ts` or `src/index.js` depending on your choice.

---

# 3. Enable KV, R2, and D1

### KV
```
wrangler kv namespace create cf_storage_demo_kv
```

For local development, also create a preview namespace:
```
wrangler kv namespace create cf_storage_demo_kv --preview
```

### R2 Bucket
```
wrangler r2 bucket create cf-storage-demo-bucket
```

### D1 Database
```
wrangler d1 create cf-storage_demo_db
```

Record the identifiers printed—you'll need them for `wrangler.jsonc`.

---

# 4. Configure `wrangler.jsonc`

Edit the `wrangler.jsonc` file to include (add to existing config, don't replace everything):

```jsonc
// filepath: wrangler.jsonc
{
  "name": "cf-storage-demo",
  "main": "src/index.js",
  "compatibility_date": "2024-09-01",
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "YOUR_KV_ID",
      "preview_id": "YOUR_PREVIEW_KV_ID"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "cf-storage-demo-bucket"
    }
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "cf_storage_demo_db",
      "database_id": "YOUR_DB_ID"
    }
  ]
}
```

Replace `YOUR_KV_ID`, `YOUR_PREVIEW_KV_ID`, and `YOUR_DB_ID` with the values from the CLI output.

**If using TypeScript**: Change `"main": "src/index.js"` to `"main": "src/index.ts"`

**Note**: The file format changed from TOML to JSONC in recent Wrangler versions. JSONC allows comments in JSON.

---

# 5. Create an initial D1 table

For **remote** (production):
```
wrangler d1 execute cf_storage_demo_db --remote --command "CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL);"
```

For **local** development:
```
wrangler d1 execute cf_storage_demo_db --local --command "CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL);"
```

With Wrangler 4.50.0, you need to run both commands to set up local and remote databases separately.

---

# 6. Create `src/index.js`

If Wrangler created `src/index.ts`, either rename it to `src/index.js` and update `wrangler.jsonc`, or adapt the code below to TypeScript.

```js
// filepath: src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/kv") {
      // Write to KV
      await env.KV.put("hello", "world");
      const val = await env.KV.get("hello");
      return new Response("KV says: " + val);
    }

    if (url.pathname === "/r2") {
      // Write to R2
      await env.R2.put("demo.txt", "Hello from R2");
      const obj = await env.R2.get("demo.txt");
      if (!obj) {
        return new Response("R2 object not found", { status: 404 });
      }
      const text = await obj.text();
      return new Response("R2 says: " + text);
    }

    if (url.pathname === "/d1") {
      // Write to D1
      await env.DB.prepare("INSERT INTO messages (text) VALUES (?)")
        .bind("Hello from D1")
        .run();
      const rows = await env.DB.prepare("SELECT * FROM messages").all();
      return new Response(JSON.stringify(rows.results, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Try /kv, /r2, or /d1");
  }
};
```

---

# 7. Run locally

```
wrangler dev
```

In Wrangler 4.50.0, `wrangler dev` automatically uses local storage for all bindings by default.

Browse:
- http://localhost:8787/
- http://localhost:8787/kv
- http://localhost:8787/r2
- http://localhost:8787/d1

**Note**: Local R2 and D1 data persist in `.wrangler/state/` directory. Delete this folder to reset local storage.

---

# 8. Deploy globally

```
wrangler deploy
```

You get a public URL like:

```
https://cf-storage-demo.<your-subdomain>.workers.dev
```

Try:

```
curl https://cf-storage-demo.<your-subdomain>.workers.dev/kv
```

---

# 9. Summary

This single Worker touches all three Cloudflare storage primitives:

| Storage | Purpose | Code |
|--------|---------|------|
| KV | quick key/value config or small data | `env.KV.put / get` |
| R2 | arbitrary objects/files | `env.R2.put / get` |
| D1 | relational SQL | `env.DB.prepare(...).run()` |

With this foundation you can:
- Build micro-APIs  
- Store transcripts  
- Save project files  
- Keep logs  
- Build simple apps  

Everything deploys in seconds and runs globally by default.

---

# End of file
