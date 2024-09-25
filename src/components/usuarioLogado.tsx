"use client"
import React, { useEffect, useState } from "react";

import { Avatar, Col, notification, Row, Tooltip, Typography } from "antd";
import { UserOutlined } from '@ant-design/icons';
import { getDoc, doc } from "firebase/firestore";
import { db } from '@/services/firebase';

export default function UsuarioLogado(){
    const [userName, setUserName] = useState(null);
    const [useEmail, setUserEmail] = useState(null);
    const userId = localStorage.getItem('EDCAR:ID');

    async function getUserById(){

        if(!userId) {
            return;
        }

        try {
            const userDocRef = doc(db, "user", userId);

            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                console.log("Usuário não encontrado.");
                return;
            }

            const userData = userDoc.data();

            if (userData) {
                setUserName(userData.name || "Nome não fornecido");
                setUserEmail(userData.email || "Email não fornecido");
                localStorage.setItem('EDCAR:UserName', userData.name);
            }
        }catch (error: unknown) {
            if(error instanceof Error){
                notification.error({
                    message: 'Erro ao carregar dados do usuário',
                    description: error.message,
                    duration: 10
                })
            }else{
                notification.error({
                    message: 'Erro ao carregar dados do usuário',
                    description: 'Erro desconhecido',
                    duration: 10
                });
            }
            
        }
    };

    useEffect(() =>  {
        getUserById();
    },[]);

    const VerificaExtensaoEmail = ({ email }: { email: string | null }): JSX.Element | string => {
        if(email && email.length > 25){
            const truncatedValue = email.substring(0, 22) + '...';
            return (
                <Tooltip title={email}>
                    <Typography.Title level={5} style={{ margin: 0, fontSize: 15, wordWrap: 'normal' }}>
                        {truncatedValue}
                    </Typography.Title>
                </Tooltip>
            );
        };

        return (
            <Typography.Title level={5} style={{ margin: 0, fontSize: 15, wordWrap: 'normal' }}>
                {email}
            </Typography.Title>
        );
    };

    return (
        <Row align="middle" justify="end" style={{ width: 420, padding: 0, textAlign: 'right', display: 'flex', justifyContent: 'flex-end'}}>
            <Col className="flex flex-col w-[50%] justify-end">
                <Typography.Title level={5} style={{ margin: 0, fontSize: 15 }}>
                    {userName}
                </Typography.Title>
                <VerificaExtensaoEmail email={useEmail}/>
            </Col>
            <Col className="ml-4">
                <Avatar shape="circle" size={40} icon={<UserOutlined />} />
            </Col>
        </Row>
    )
}