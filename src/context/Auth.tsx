import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import { notification } from "antd";
import { useRouter } from "next/navigation";

type UserLogin = {
    email: string;
    password: string;
}

interface AuthContextData {
    isAuthenticated: boolean;
    token: string | null;
    login: (dados: UserLogin) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
    return useContext(AuthContext);
};

function AuthProvider({ children }: AuthProviderProps){

    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(localStorage.getItem('EDCAR:TOKEN'));
    const urlApi = 'http://localhost:3333';

    const router = useRouter();

    const logout = async () => {
        localStorage.removeItem('EDCAR:TOKEN');
        localStorage.removeItem('EDCAR:ID');
        setToken(null)
    };

    const login = async (dados: UserLogin) => {
        setLoading(true);

        const body = {
            "email": dados.email,
            "password": dados.password
        };

        try {
            const response = await fetch(`${urlApi}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
    
            const data = await response.json();
    
            if(data.token){
                setLoading(false);
                localStorage.setItem('EDCAR:TOKEN', data.token);
                localStorage.setItem('EDCAR:ID', data.userId);
                setToken(data.token);
                router.push('/');
            }else{
                setLoading(false);
                notification.error({
                    message: 'Erro de login',
                    description: data.message || 'Erro ao fazer login',
                    duration: 10
                })
            }

        } catch (error){
            notification.error({
                message: 'Erro de login',
                description: 'Erro ao se comunicar com o servidor',
                duration: 10,
            });
        }

    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );

}

export { AuthContext, AuthProvider };