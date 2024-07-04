"use client"
import React from "react";

import { Avatar, Col, Row, Tooltip, Typography } from "antd";
import {
    UserOutlined,
    CloseCircleOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

export default function UsuarioLogado(){
    const email= 'jennyknowles04@gmail.com';
    

    const VerificaExtensaoEmail = ({ email }: { email: string }): JSX.Element | string => {
        if(email.length > 25){
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
                    Jennyfer.Sampaio {/* {nmUsuarioLogado} */}
                </Typography.Title>
                <VerificaExtensaoEmail email={email}/>
            </Col>
            <Col className="ml-4">
                <Avatar shape="circle" size={40} icon={<UserOutlined />} />
            </Col>
        </Row>
    )
}