import React, { createContext, useState, ReactNode, useContext } from "react";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/services/firebase";

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

    const router = useRouter();

    const logout = async () => {
        setLoading(true)

        try {
            await signOut(auth);

            localStorage.removeItem('EDCAR:TOKEN');
            localStorage.removeItem('EDCAR:ID');
            localStorage.removeItem('EDCAR:UserName');

            setToken(null);
            
            router.push('/login');
        } catch (error) {
            notification.error({
                message: 'Erro ao deslogar',
                description: 'Não foi possível fazer o logout',
                duration: 10,
            });
        }finally {
            setLoading(false)
        }
    };

    const login = async (dados: UserLogin) => {
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, dados.email, dados.password);
            const token = await userCredential.user.getIdToken();

            localStorage.setItem('EDCAR:TOKEN', token);
            localStorage.setItem('EDCAR:ID', userCredential.user.uid);
            setToken(token);

            router.push('/');
        } catch (error) {
            notification.error({
                message: 'Erro de login',
                description: 'Credenciais inválidas ou erro no servidor',
                duration: 10,
            });
        }finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!token, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );

}

export { AuthContext, AuthProvider };