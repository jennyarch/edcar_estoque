"use client"
import React, { useState } from "react";
import type { MenuProps } from "antd";
import { Layout, Menu, Space, Typography, Button, Spin } from 'antd';
import { HomeOutlined, InboxOutlined, LogoutOutlined } from '@ant-design/icons';
import UsuarioLogado from "./usuarioLogado";
import Estoque from "../app/Estoque/page";
import Inicio from '../app/Inicio/page';
import { useAuth } from "@/context/Auth";
import './custom.css';
import Image from "next/image";
import Logo from '../assets/logo-white.png';

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
	const { logout, loading } = useAuth();

	const items: MenuItem[] = [
		getItem('Inicio', '1', <HomeOutlined />, undefined, () => {
			setSelectedKey('1'); 
		}),
		getItem('Estoque', '2', <InboxOutlined />, undefined, () => {
			setSelectedKey('2');
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
				id="siderMenu"
				collapsible
				collapsed={false} //Para evitar o Sider de collapsar
				trigger={
					<Button
						type="primary"
						icon={<LogoutOutlined />}
						loading={loading}
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
				<Space className="flex flex-col justify-center bg-[#991b1b] p-2 min-h-2 mb-2">
					<Image src={Logo} alt="Logotipo Ed Car" layout="responsive"/>
				</Space>
				<Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
			</Sider>

			<Layout>
				<Header className='flex flex-row justify-between bg-white h-[80px] pt-[10px] pb-0 items-center'>
					<Space className='flex' style={{ display: "flex", alignItems: "center", gap: 30, paddingLeft: 10 }}>
						<Space style={{ display: "block", marginTop: 20, marginRight: 20, marginBottom: 20 }}>
							<Typography.Title level={5} >
								Olá, seja bem vindo!
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