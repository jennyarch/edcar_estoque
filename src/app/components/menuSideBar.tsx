"use client"
import React, { useState } from "react"
import { useRouter } from 'next/navigation';

import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, Space, theme, Avatar, Row, Col, Typography, Button, notification } from 'antd';
import { HomeOutlined, InboxOutlined, LogoutOutlined } from '@ant-design/icons';
import UsuarioLogado from "./usuarioLogado";
import Estoque from "../Estoque/page";
import Inicio from '../Inicio/Inicio';
import { useAuth } from "@/context/Auth";

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
		label,
		key,
		icon,
		children,
		onClick,
	} as MenuItem;
};

export const MenuSideBar = () => {
    const router = useRouter()
	const { logout } = useAuth();

	const items: MenuItem[] = [
		getItem('Inicio', '1', <HomeOutlined />, undefined, () => {
			setSelectedKey('1'); 
			// router.push('/Inicio')
		}),
		getItem('Estoque', '2', <InboxOutlined />, undefined, () => {
			setSelectedKey('2');
			// router.push('/Estoque')
		})
	];

	const [selectedKey, setSelectedKey] = useState('1');

	const renderContent = () => {
		switch(selectedKey){
			case '1':
				return <Inicio/>
			case '2':
				return <Estoque/>
			default:
				return <Inicio/>;
		}
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider
				collapsible
				collapsed={false} //Para evitar o Sider de collapsar
				trigger={
                    <Button
                        type="primary"
                        icon={<LogoutOutlined />}
                        style={{
                            width: '80%',
                            background: '#991b1b',
                            border: 'none',
                            height: '32px',
                        }}
                    >
                        Sair
                    </Button>
                }
                onCollapse={(collapsed) => {
                    if (collapsed) {
                        logout();
                    }
                }}
				
			>
				<div className="flex justify-center bg-slate-800 p-2 min-h-2 rounded mt-2 mb-2">
					<h1 className="text-white text-lg">Ed Car</h1>
				</div>
				<Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
			</Sider>

			<Layout>
				<Header className='flex flex-row justify-between bg-white h-[80px] pt-[10px] pb-0 items-center'>
					<Space className='flex' style={{ display: "flex", alignItems: "center", gap: 30, paddingLeft: 20 }}>
						<Space style={{ display: "block", marginTop: 20, marginRight: 20, marginBottom: 20 }}>
							<Typography.Title level={5} >
								Olá, Jennyfer Sampaio
							</Typography.Title>
						</Space>
					</Space>
					<UsuarioLogado/>
				</Header>

				<Content className='h-[100%] mt-[10px] mb-[16px] ml-[16px] mr-[16px]'>
					{renderContent()}
				</Content>

				<Footer style={{ textAlign: 'center' }}>
					©{new Date().getFullYear()} Created by Jennyfer Sampaio
				</Footer>
			</Layout>
		</Layout>
	);
}