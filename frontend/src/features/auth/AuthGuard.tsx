import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = localStorage.getItem('salon_auth');
        if (auth) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Basic Auth encoding: base64(username:password)
            const encoded = btoa(`${username}:${password}`);
            localStorage.setItem('salon_auth', encoded);
            setIsAuthenticated(true);
            setError('');
        } catch (err) {
            setError('Invalid characters in username or password');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                            Salon Ops AI
                        </h1>
                        <p className="text-slate-400 text-sm">Please sign in to access the dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />

                        {error && (
                            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full py-3">
                            Sign In
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    // Add a logout button to the children by providing a context or just adding it to the UI elsewhere
    // For now, let's just render the children. I'll add a logout button to the header in App.tsx later.
    return <>{children}</>;
};
