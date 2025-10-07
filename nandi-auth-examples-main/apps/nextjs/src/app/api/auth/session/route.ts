import { cookies } from "next/headers";

export async function GET() {
	try {
		const cookieStore = await cookies();
		const sessionToken = cookieStore.get("nandi_session_token");

		// pass cookies from the request to the auth server
		const res = await fetch(
			`${process.env.NEXT_AUTH_URL}/auth/get-session?client_id=${process.env.NEXT_AUTH_CLIENT_ID}`,
			{
				headers: {
					"Content-Type": "application/json",
					cookie: sessionToken ? `nandi_session=${sessionToken.value}` : "",
				},
			},
		);

		const data = await res.json();

		if (res.status !== 200) {
			return new Response(data.message, { status: 500 });
		}

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		console.error(error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
