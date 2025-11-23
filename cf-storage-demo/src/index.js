// filepath: src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/kv") {
      // Write to KV
      await env.kv.put("hello", "world");
      const val = await env.kv.get("hello");
      return new Response("KV says: " + val);
    }

    /*if (url.pathname === "/r2") {
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
    }*/

    return new Response("Try /kv, /r2, or /d1");
  }
};
