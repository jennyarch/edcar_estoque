"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";

import { Avatar, Col, notification, Row, Tooltip, Typography } from "antd";
import {
    UserOutlined,
    CloseCircleOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

export default function UsuarioLogado(){
    const [userName, setUserName] = useState(null);
    const [useEmail, setUserEmail] = useState(null);
    const userId = localStorage.getItem('EDCAR:ID');
    const urlApi = 'http://localhost:3333';

    async function getUsers(){

        await axios.get(`${urlApi}/users/${userId}`)
        .then(res => {
            const user = res.data.user;

            setUserName(user.name);
            setUserEmail(user.email);
        })
        .catch(err => {
            notification.error({
                message: 'Erro ao carregar dados do usuário',
                description: err.message,
                duration: 10
            })
        })
    };

    useEffect(() => {
        getUsers();
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