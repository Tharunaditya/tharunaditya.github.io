const { Octokit } = require("@octokit/rest");
const randomstring = require("randomstring");

const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;

exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters, body } = event;

  // Handle OAuth callback
  if (httpMethod === "GET" && queryStringParameters.code) {
    const code = queryStringParameters.code;

    try {
      // Exchange code for access token
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        // Return success page with token
        const script = `
          <script>
            const receiveMessage = (message) => {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify({
                  token: data.access_token,
                  provider: "github"
                })}',
                message.origin
              );
              window.removeEventListener("message", receiveMessage, false);
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          </script>
        `;
        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: script,
        };
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Failed to get access token" }),
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }

  // Handle initial auth request
  if (httpMethod === "GET" && !queryStringParameters.code) {
    const state = randomstring.generate(32);
    const authURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user&state=${state}`;

    return {
      statusCode: 302,
      headers: {
        Location: authURL,
      },
    };
  }

  return {
    statusCode: 404,
    body: "Not found",
  };
};
