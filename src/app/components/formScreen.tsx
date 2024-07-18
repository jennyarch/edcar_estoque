import React, { useEffect, useState } from "react";
import { Col, Form, Row, Input, Typography, Button, InputNumber, FormInstance } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface FormValues {
    nome: string;
    estoque: number;
}

interface FormScreenProps {
    form: FormInstance;
    formValues: FormValues | null;
    onFinish: (values: any) => void;
}

const FormScreen: React.FC<FormScreenProps> = ({ form, formValues, onFinish }) => {

    function fillEditModalData() {
        if (formValues) {
            form.setFieldsValue({
                nome: formValues.nome,
                qtdEstoque: formValues.estoque
            });
        }
    };

    const handleClear = (field: string) => {
        if(field === 'nome'){
            form.setFieldsValue({
                nome: '',
            });
        };

        if(field === 'estoque'){
            form.setFieldsValue({
                qtdEstoque: '',
            });
        };
    };

    useEffect(() => {
        fillEditModalData()
    }, [formValues]);

    return(
        <Form
            layout="horizontal"
            onFinish={onFinish}
            form={form}
        >
            <Row gutter={16} className="mt-10">
                <Col span={24}>
                    <Form.Item
                        name="nome"
                        label="Nome"
                        rules={[ { required: true, message: 'Informe o nome do produto.' }]}
                    >
                        <Input
                            placeholder="Digite o nome do produto"
                            size="small"
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('nome')}></Button>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="qtdEstoque"
                        label="Quantidade Estoque"
                        rules={[ 
                            { required: true, message: 'Informe a quantidade desejada.' },
                            {
                                validator: (_, value) =>
                                    value && !/^\d+$/.test(value) ? Promise.reject('Apenas números são permitidos') : Promise.resolve(),
                            },
                        ]}
                    >
                        <Input
                            className="w-[30%]"
                            placeholder="1"
                            maxLength={16}
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('estoque')}></Button>
                            }
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

export default FormScreen;