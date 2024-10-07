import React, { useEffect } from "react";
import { Col, Form, Row, Input, Button, FormInstance } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { NumericFormat } from 'react-number-format';

interface FormValues {
    id: string;
    nome: string;
    modelo: string;
    descricao: string;
    medidas: string;
    qtdEstoque: string;
    codigo: string;
    valor: number;
}

interface FormScreenProps {
    form: FormInstance;
    formValues: FormValues | null;
    isDelete: boolean | undefined;
    isSell: boolean | undefined;
    isDiafragma: boolean | undefined;
    onFinish: (values: any) => void;
}

const FormScreen: React.FC<FormScreenProps> = ({ form, formValues, isDelete, isSell, isDiafragma, onFinish }) => {

    function fillEditModalData() {
        if (formValues) {
            form.setFieldsValue({
                id: formValues.id,
                nome: formValues.nome,
                modelo: formValues.modelo,
                descricao: formValues.descricao,
                medidas: formValues.medidas,
                qtdEstoque: formValues.qtdEstoque,
                codigo: formValues.codigo,
                valor: formValues.valor
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
        if(field === 'modelo'){
            form.setFieldsValue({
                modelo: '',
            });
        };

        if(field === 'descricao'){
            form.setFieldsValue({
                descricao: '',
            });
        };

        if(field === 'medidas'){
            form.setFieldsValue({
                medidas: '',
            });
        };

        if(field === 'baixa'){
            form.setFieldsValue({
                baixa: '',
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
                        hidden={isDelete}
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
                        name="modelo"
                        label="Modelo"
                        hidden={isDelete}
                        rules={[ 
                            { required: true, message: 'Informe o modelo do carro.' }
                        ]}
                    >
                        <Input
                            placeholder="Modelo do carro"
                            maxLength={36}
                            size="small"
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('modelo')}></Button>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="descricao"
                        label="Descrição"
                        hidden={isDelete}
                    >
                        <Input
                            placeholder="Digite uma descrição para o produto"
                            maxLength={50}
                            size="small"
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('descricao')}></Button>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="medidas"
                        label="Medida(mm)"
                        hidden={isDelete}
                        rules={[ { required: true, message: 'Informe a medida.' },
                            {
                                validator: (_, value) =>
                                    value && !/^\d+$/.test(value) ? Promise.reject('Apenas números são permitidos') : Promise.resolve(),
                            },
                            // {
                            //     validator: (_, value) => 
                            //         value && !/^\d+mm$/.test(value) 
                            //             ? Promise.reject('A medida deve ser informada em milímetros, ex: 40mm') 
                            //             : Promise.resolve(),
                            // },
                        ]}
                    >
                        <Input
                            placeholder="10"
                            className="w-[30%]"
                            size="small"
                            maxLength={50}
                            suffix={
                                <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('medidas')}></Button>
                            }
                        />
                    </Form.Item>

                    {!isDiafragma && 
                        <Form.Item
                            name="valor"
                            label="Valor(Unitário)"
                            hidden={isDelete}
                            rules={[
                                { required: true, message: 'Informe o valor do produto unitário.' }
                            ]}
                        >
                            <NumericFormat
                                className="w-[30%]"
                                thousandSeparator="."
                                decimalSeparator=","
                                decimalScale={2}
                                fixedDecimalScale={true}
                                allowNegative={false}
                                prefix={'R$ '}
                                placeholder="R$ 0,00"
                                customInput={Input}
                            />

                        </Form.Item>
                    }

                    <Form.Item
                        name="qtdEstoque"
                        label="Quantidade Estoque"
                        hidden={isDelete}
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
                        hidden={isDelete}
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

                    {isSell &&
                        <Form.Item
                            name="baixa"
                            label="Quantidade para dar baixa"
                            rules={[ 
                                { required: true, message: 'Informe a quantidade desejada.' },
                                {
                                    validator: (_, value) =>
                                        value && !/^\d+$/.test(value) ? Promise.reject('Apenas números são permitidos') : Promise.resolve(),
                                },
                            ]}
                        >
                            <Input
                                className="w-[40%]"
                                placeholder="1"
                                maxLength={100}
                                suffix={
                                    <Button type="text" icon={<CloseOutlined/>} className="text-red-400 text-sm mr-[-8px]" onClick={() => handleClear('baixa')}></Button>
                                }
                            />

                        </Form.Item>
                    }
                </Col>
            </Row>
        </Form>
    );
}

export default FormScreen;