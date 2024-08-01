'use client';
import React, { useState } from "react";
import { Layout, Space, Typography, Button, Row, Col, Form, Input } from "antd";
import Image from "next/image";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

import logo from '../../assets/logo.png';
import logoBg from '../../assets/logoBackground.svg';

type UserLogin = {
    email: string;
    password: string;
}

export default function Login(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const router = useRouter();
    
    const [form] = Form.useForm();

    async function handleLogin(dados: UserLogin){
        setEmail(dados.email)
        setPassword(dados.password)

        try {
            await authService.login(email, password);
                router.push('/');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        }

        await authService.login(email, password);
    }

    return(
        <Layout className="h-[100vh] w-[100vw] p-[40px] bg-blue-950">
            <Row className="h-[100vw]">
                <Col className="w-[30%] bg-slate-100 rounded-md p-20 flex flex-col justify-center">
                    <Row justify="center" >
                        <Image src={logo} alt="Logotipo Ed Car" layout="responsive" className="w-[250px]"/>
                    </Row>

                    <Col>
                        <Row justify="center">
                            <Typography.Title level={4} style={{ color: '#000', marginBottom: 20 }}>
                                Login
                            </Typography.Title>
                        </Row>

                        <Form
                            name="login"
                            onFinish={handleLogin}
                            layout="vertical"
                            hideRequiredMark
                            form={form}
                            className="w-[100%] h-[100%] p-0 m-0 flex flex-col"
                        >
                            
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Informe o e-mail cadastrado!',
                                    },
                                ]}
                                style={{ marginBottom: 30 }}
                            >
                                <Input placeholder="E-mail" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Preencha a senha!',
                                    },
                                ]}
                                style={{ marginBottom: 30 }}
                            >
                                <Input.Password placeholder="Senha" />
                            </Form.Item>

                            <Form.Item>
                                <Button className="w-[100%] h-[40px] bg-red-700 drop-shadow-md font-medium text-[20px]" type="primary" htmlType="submit">
                                    Entrar
                                </Button>
                            </Form.Item>

                        </Form>

                        {/* <Row justify="center">
                            <Link to={"/esqueci-minha-senha"}>
                                <Typography.Text level={5} style={{ color: '#7E1416' }}>
                                    Esqueceu sua senha?
                                </Typography.Text>
                            </Link>
                        </Row> */}
                        </Col>
                </Col>

                <Col className="w-[70%] h-[100%] bg-red-800 rounded-md flex justify-center items-center">
                    <Image src={logoBg} alt="" className="w-[80%] h-[80%]"/>
                </Col>
            </Row>
        </Layout>
    )
}