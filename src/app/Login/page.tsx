import React from "react";
import { Layout, Space, Typography, Button, Row, Col, Form, Input } from "antd";

export default function Login(){

    // const { signIn, loading, erroLogin } = useAuth();
    const [form] = Form.useForm();

    return(
        <Layout className="h-[100vh] w-[100vw] p-[40px] bg-#00152a">
            <Row>
                <Col className="w-[30%]">
                    <Col>
                        <Row justify="center">
                            <Typography.Title level={4} style={{ color: '#000', marginBottom: 20 }}>
                                Login
                            </Typography.Title>
                        </Row>

                        <Form
                            name="login"
                            onFinish={() => console.log('formulario enviado')}
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
                                <Button  type="primary" htmlType="submit">
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

                <Col className="w-[70%]">
                </Col>
            </Row>
        </Layout>
    )
}