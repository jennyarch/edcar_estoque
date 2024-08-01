import React, { useEffect } from "react";
import { Col, Form, Row, Input, Button, FormInstance } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

interface FormValues {
    id: string;
    nome: string;
    qtdEstoque: string;
    codigo: string;
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
                id: formValues.id,
                nome: formValues.nome,
                qtdEstoque: formValues.qtdEstoque,
                codigo: formValues.codigo
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

        if(field === 'codigo'){
            form.setFieldsValue({
                codigo: '',
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
                        name="id"
                        label="Id"
                        hidden={true}
                    >
                        <Input/>
                    </Form.Item>

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

                    <Form.Item
                        name="codigo"
                        label="Código do Produto"
                        rules={[ 
                            { required: true, message: 'Informe o código do produto.' },
                            {
                                validator: (_, value) =>
                                    value && !/^\d+$/.test(value) ? Promise.reject('Apenas números são permitidos') : Promise.resolve(),
                            },
                        ]}
                    >
                        <Input
                            className="w-[30%] ml-2"
                            placeholder="1"
                            maxLength={32}
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('codigo')}></Button>
                            }
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

export default FormScreen;