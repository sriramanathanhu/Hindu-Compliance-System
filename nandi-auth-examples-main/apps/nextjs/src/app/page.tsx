import Image from "next/image";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";


const getSession = async () => {
	try {
		const cookieStore = await cookies();

		const res = await fetch(`${process.env.NEXT_BASE_URL}/api/auth/session`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				cookie: cookieStore.toString()
			},
			credentials: "include",
		});
		const json = await res.json();

		return json;
	} catch (err) {
		console.error("Error fetching session:", err);
		return null;
	}
}

export default async function Home() {
	const session = await getSession();
	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-[32px] row-start-2 items-center">
				<Image
					className="dark:invert"
					src="/logo.png"
					alt="SPH logo"
					width={180}
					height={38}
					priority
				/>

				{
					JSON.stringify(session ?? {})
				}

				<a
					className={cn(
						"rounded-full border border-solid border-transparent transition-colors flex items-center justify-center",
						"bg-primary text-white gap-2 font-medium",
						"text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto",
					)}
					href={`${process.env.NEXT_AUTH_URL}/auth/sign-in?client_id=${process.env.NEXT_AUTH_CLIENT_ID}&redirect_uri=${process.env.NEXT_BASE_URL}/api/auth/callback`}
				>
					Sign In With Kailasa
				</a>
			</main>
		</div>
	);
}
