// app/not-found.tsx
'use client'
import { Button, Result } from 'antd'; // Caso você use o Ant Design ou outro framework
import React from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <Result
            className="mt-20"
            status="404"
            title="404"
            subTitle="Desculpa, a página que você está tentando visitar não existe."
            extra={
                <Button onClick={() => router.push("/Login")} type="primary">
                    Voltar para a Página Inicial
                </Button>
            }
        />
    );
}
