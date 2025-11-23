# Cloudflare Workers Hello-World Tutorial  
This single-file guide walks you through creating a trivial Cloudflare Workers project that:
- Responds to HTTP requests
- Uses **KV**, **R2**, and **D1** storage
- Lets you test via browser or command line
- Stays extremely simple

You can drop this file into VS Code and work through it step‑by‑step.

---

# 1. Install prerequisites

### Install `wrangler` (Cloudflare CLI)
```
npm install -g wrangler
```

### Log in
```
wrangler login
```

---

# 2. Create the project
```
wrangler init cf-storage-demo
cd cf-storage-demo
```

Choose **ES modules** and **no GitHub template** if asked.

---

# 3. Enable KV, R2, and D1

### KV
```
wrangler kv:namespace create STORAGE_DEMO_KV
```

### R2 Bucket
```
wrangler r2 bucket create storage-demo-bucket
```

### D1 Database
```
wrangler d1 create storage_demo_db
```

Record the identifiers printed—wrangler will help wire them in.

---

# 4. Configure `wrangler.toml`

Edit the file to include:

```toml
name = "cf-storage-demo"
main = "src/index.js"
compatibility_date = "2024-09-01"

kv_namespaces = [
  { binding = "KV", id = "YOUR_KV_ID" }
]

r2_buckets = [
  { binding = "R2", bucket_name = "storage-demo-bucket" }
]

[[d1_databases]]
binding = "DB"
database_name = "storage_demo_db"
database_id = "YOUR_DB_ID"
```

Replace KV/R2/D1 IDs with the values from the CLI.

---

# 5. Create an initial D1 table

```
wrangler d1 execute storage_demo_db --command "
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL
);
"
```

---

# 6. Create `src/index.js`

```js
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

Browse:
- http://localhost:8787/
- http://localhost:8787/kv
- http://localhost:8787/r2
- http://localhost:8787/d1

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
curl https://.../kv
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
