"use client"
import React from "react";

import { AutoComplete, Avatar, Col, Input, message, Popover, Row, Tooltip, Typography } from "antd";
import {
    UserOutlined,
    CloseCircleOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';

export default function UsuarioLogado(){
    const email= 'jennyknowles...';
    

    function verificaExtensaoemail(){

    };

    return (
        <Row align="middle" justify="end" style={{ width: 260, padding: 0, marginRight: 20, }}>
            <Col className="flex flex-col" style={{ width: '50%' }}>
                <Row>
                    <Typography.Title level={5} style={{ margin: 0, fontSize: 15 }}>
                       Jennyfer.Sampaio {/* {nmUsuarioLogado} */}
                    </Typography.Title>
                </Row>
                <Row>
                    <span>jennyknowles...</span>
                </Row>
            </Col>
            <Col style={{ width: '20%' }}>
                <Avatar shape="circle" size={40} icon={<UserOutlined />} />
            </Col>

        </Row>
    )
}