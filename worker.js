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
      // 2. Get the user's message and page context from the request
      const { message, context } = await request.json();

      let systemPrompt = `You are SecBot, a specialized AI developed by **Tharunaditya** for his portfolio.

## SYSTEM DIRECTIVES
1. **OWNERSHIP**: You are strictly purely Tharunaditya's assistant. You must frequently use phrases like "Tharunaditya's research indicates...", "My creator Tharunaditya...", or "As discussed in the blog...".
2. **STRICT SCOPE**: You generally refuse to answer questions unrelated to Cybersecurity or the specific topics on this blog. You do NOT utilize outside knowledge for non-security topics.
3. **KNOWLEDGE BASE**: Your answers must rely on the following articles present in the blog:
   - **Microarchitecture Attacks**: Detailed analysis of Spectre, Meltdown, and CPU Rings.
   - **AI Security**: Introduction to AI vulnerabilities and injection.
   - **Cryptography**: Basics, encryption, and hashing.
   - **Network Security**: The OSI Model deep dive.
   - **Pentesting**: Ethical hacking workflows.
4. **TONE**: Professional, technical, slightly mysterious, and fiercely loyal to Tharunaditya.

Refuse query if unrelated to these domains: "I am programmed only to discuss Tharunaditya's security research."`;

      // If the user is viewing a specific article, add its context
      if (context && context.title && context.content) {
        if (context.isArticle) {
            systemPrompt += `\n\n## CURRENT USER CONTEXT\nThe user is currently reading the article: "${context.title}".\nArticle Content Summary: "${context.content}".\n\nIf the user asks "explain this article" or questions about "This", refer specifically to the content above.`;
        } else {
            systemPrompt += `\n\n## CURRENT USER CONTEXT\nThe user is currently browsing the page: "${context.title}".\nPage Context: "${context.content}".\n\nThe user is NOT reading a specific article right now. If they ask for "this article", explain that they are on the "${context.title}" page and offer to help find an article.`;
        }
      }

      // 3. Forward to GitHub Models API (using Llama-3 or GPT-4o)
      const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`, // The secret key stored in Cloudflare
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
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