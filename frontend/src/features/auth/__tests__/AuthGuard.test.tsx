import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';

describe('AuthGuard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders login form when not authenticated', () => {
        render(
            <AuthGuard>
                <div data-testid="protected">Protected Content</div>
            </AuthGuard>
        );
        expect(screen.getByText(/Please sign in/i)).toBeInTheDocument();
        expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });

    it('renders children when authenticated', () => {
        localStorage.setItem('salon_auth', 'YWRtaW46cGFzc3dvcmQ='); // admin:password
        render(
            <AuthGuard>
                <div data-testid="protected">Protected Content</div>
            </AuthGuard>
        );
        expect(screen.getByTestId('protected')).toBeInTheDocument();
    });

    it('allows user to login', () => {
        render(
            <AuthGuard>
                <div data-testid="protected">Protected Content</div>
            </AuthGuard>
        );

        fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        expect(screen.getByTestId('protected')).toBeInTheDocument();
        expect(localStorage.getItem('salon_auth')).toBe(btoa('admin:password'));
    });
});
