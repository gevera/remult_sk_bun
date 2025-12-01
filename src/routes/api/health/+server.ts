import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/** @type {RequestHandler} */
export function GET() {
	return json({ status: "ok" });
}

