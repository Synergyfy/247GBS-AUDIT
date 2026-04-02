import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from './authTypes';
import { API_BASE_URL } from '@/lib/api';

const BASE_URL = API_BASE_URL;

export function useAuthActions() {
    const { signIn: contextSignIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (data: SignInRequest): Promise<{ success: boolean; role?: string }> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/auth/signin`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            // Read response safely (handle non-JSON errors)
            const contentType = response.headers.get('content-type') || '';
            let result: any = null;
            if (contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                // If backend returned HTML (e.g., 404 page), surface a readable message
                throw new Error(`Unexpected response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                throw new Error(result.message || 'Failed to sign in');
            }

            const { accessToken, user } = result as SignInResponse;
            
            // Store token in localStorage
            localStorage.setItem('247gbs_token', accessToken);
            
            const userEmail = user?.email ?? data.email;
            contextSignIn({
                email: userEmail,
                name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined,
                role: user?.role,
            });
            
            return { success: true, role: user?.role };
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in');
            return { success: false, role: undefined };
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (data: SignUpRequest): Promise<{ success: boolean; role?: string }> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const contentType = response.headers.get('content-type') || '';
            let result: any = null;
            if (contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Unexpected response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                throw new Error(result.message || 'Failed to sign up');
            }

            // If signup returned an access token, persist it and update context
            const accessToken = (result as SignUpResponse & { accessToken?: string })?.accessToken;
            let role: string | undefined = undefined;
            if (accessToken) {
                localStorage.setItem('247gbs_token', accessToken);
                // If backend also returned user info, update context
                const user = (result as SignUpResponse).user;
                role = user?.role;
                const userEmail = user?.email ?? data.email;
                contextSignIn({
                    email: userEmail,
                    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined,
                    role: user?.role,
                });
            }

            return { success: true, role };
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
            return { success: false, role: undefined };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        signIn,
        signUp,
        isLoading,
        error,
    };
}
