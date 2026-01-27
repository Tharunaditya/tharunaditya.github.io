export default {
  async fetch(request, env) {
    // 1. Handle CORS (Allow your blog to access this)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*", // Replace '*' with 'https://tharunaditya.github.io' for production security
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 2. Get the user's message from the request
      const { message } = await request.json();

      // 3. Forward to GitHub Models API (using Llama-3 or GPT-4o)
      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`, // The secret key stored in Cloudflare
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are SecBot, a helpful cybersecurity assistant for the blog 'Tharunaditya Security'. Keep answers concise, technical, and related to security." },
            { role: "user", content: message }
          ],
          model: "gpt-4o", // Or "Meta-Llama-3-70B-Instruct"
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      const data = await response.json();

      // 4. Return the AI's reply to the blog
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // Same here, restrict in production
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};