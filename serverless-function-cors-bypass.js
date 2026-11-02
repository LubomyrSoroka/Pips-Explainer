// called by cloudflare worker to bypass the cors issue

export default {
    async fetch(request) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
        };

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: corsHeaders,
            });
        }

        if (request.method !== "GET") {
            return new Response("Method not allowed", {
                status: 405,
                headers: corsHeaders,
            });
        }

        const url = new URL(request.url);
        const date = url.searchParams.get("date");

        // Validate YYYY-MM-DD
        const parsedDate = new Date(`${date}T00:00:00Z`);

        if (
            !date ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== date
        ) {
            return new Response("Invalid date. Expected YYYY-MM-DD.", {
                status: 400,
                headers: corsHeaders,
            });
        }

        const nytUrl = `https://www.nytimes.com/svc/pips/v1/${date}.json`;

        try {
            const response = await fetch(nytUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                },
            });

            return new Response(response.body, {
                status: response.status,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        response.headers.get("Content-Type") || "application/json",
                },
            });
        } catch (error) {
            return new Response("Failed to fetch NYT API.", {
                status: 502,
                headers: corsHeaders,
            });
        }
    },
};
