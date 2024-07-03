"use client" //Hidratação dos componentes -> convertendo o component em um clinete component
import React, { useState, useEffect } from 'react';

import type { MenuProps } from 'antd';
import { Breadcrumb, Layout, Menu, Space, theme, Avatar, Row, Col, Typography } from 'antd';
import { HomeOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import UsuarioLogado from './components/usuarioLogado';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    onClick?: () => void
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        onClick,
    } as MenuItem;
};

const items: MenuItem[] = [
    getItem('Inicio', '1', <HomeOutlined />),
    getItem('Estoque', '2', <InboxOutlined />)
];

export default function Home(){

    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="flex justify-center bg-slate-800 p-2 min-h-2 rounded mt-2 mb-2">
                    <h1 className='text-lg text-white'>Ed Car</h1>
                </div>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Sider>

            <Layout>
                <Header className='flex flex-row justify-between bg-container h-[80px]'>
                    <Space className='flex' style={{ display: "flex", alignItems: "center", gap: 30, paddingLeft: 20 }}>
                        <Space style={{ display: "block", marginTop: 20, marginRight: 20, marginBottom: 20 }}>
                            <Typography.Title level={5} >
                                Olá, Jennyfer Sampaio
                            </Typography.Title>
                        </Space>
                    </Space>

                    <UsuarioLogado/>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        Bill is a cat.
                    </div>
                </Content>

                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
}