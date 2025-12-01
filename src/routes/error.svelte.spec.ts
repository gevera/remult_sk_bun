import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte/svelte5';
import ErrorPage from './+error.svelte';

// Mock $app/state
vi.mock('$app/state', () => ({
	page: {
		status: 404,
		error: {
			message: 'Not Found'
		}
	}
}));

// Mock $lib/ROUTES
vi.mock('$lib/ROUTES', () => ({
	route: (path: string) => path
}));

describe('/+error.svelte', () => {
	it('should render title and link to home page', () => {
		render(ErrorPage);

		const heading = screen.getByRole('heading', { level: 1 });
		expect(heading).toBeInTheDocument();
		expect(heading).toHaveTextContent('404: Not Found');

		const homeLink = screen.getByRole('link', { name: /go to home/i });
		expect(homeLink).toBeInTheDocument();
		expect(homeLink).toHaveAttribute('href', '/');
	});
});

