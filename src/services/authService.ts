import { notification } from "antd";

export const authService = {
    login,
    logout,
    isAuthenticated,
    getUser,
};

type User = {
    id: string;
    name: string;
    email: string;
};

function login(email: string, password: string): Promise<User> {

    console.log(email)
    console.log(password)

    return new Promise((resolve, reject) => {
        if (email === 'teste@exemplo.com' && password === '123456') {
            const user: User = {
                id: '1',
                name: 'Jennyfer Sampaio',
                email: email,
            };
            localStorage.setItem('user', JSON.stringify(user));
            resolve(user);
        } else {
            notification.error({
                message: 'Usuário e/ou senha inválidos',
                duration: 10
            })
            // reject(new Error('Invalid credentials'));
        }
    });
}

function logout() {
    localStorage.removeItem('user');
}

function isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
}

function getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}