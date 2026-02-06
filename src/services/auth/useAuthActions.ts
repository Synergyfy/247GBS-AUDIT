import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SignInRequest, SignInResponse, SignUpRequest, SignUpResponse } from './authTypes';
import { API_BASE_URL } from '@/lib/api';

const BASE_URL = API_BASE_URL;

export function useAuthActions() {
    const { signIn: contextSignIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (data: SignInRequest): Promise<boolean> => {
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
            
            // Update context (using email as name for now if user object is not fully present)
            const userEmail = user?.email ?? data.email;
            // Update context with the authenticated user's email
            contextSignIn(userEmail);
            
            return true;
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign in');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (data: SignUpRequest): Promise<boolean> => {
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
            if (accessToken) {
                localStorage.setItem('247gbs_token', accessToken);
                // If backend also returned user info, update context
                const userEmail = (result as SignUpResponse).user?.email ?? data.email;
                contextSignIn(userEmail);
            }

            return true;
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up');
            return false;
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
