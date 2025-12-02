import { describe, expect, it } from 'vitest';
import { GET } from './+server';
import type { RequestEvent } from './$types';

describe('/healthcheck', () => {
	it('should return status 200 with { status: "ok" }', async () => {
		const event = {} as RequestEvent;
		const response = await GET(event);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({ status: 'ok' });
	});
});

