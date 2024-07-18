'use client';
import React, { useState, useEffect } from 'react';
import { Space, Layout, Typography, Col, Row, Input, Button, Table, Form } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ModalScreen from '../components/modalScreen';
import useFetchData from '../hook/useFetchData';
import type { ColumnsType } from 'antd/es/table';
import FormScreen from '../components/formScreen';

const { Content } = Layout;

interface DataType {
    key: number;
    codigo: string;
    nome: string;
    estoque: number;
}

export default function Estoque() {

    const { data, loading, error } = useFetchData();
    const [rowData, setRowData] = useState<DataType | null>(null);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);

    const [form] = Form.useForm();

    const showModal = (action: string) => {
        switch(action) {
            case 'editar':
                setIsModalOpenEdit(true);
                // fillEditModalData()
                break;
            case 'deletar':
                setIsModalOpenDelete(true);
                break;
            case 'criar':
                setIsModalOpenCreate(true);
                break;

            default:
                console.log('Ação desconhecida', action);
                break;
        }
    };

    const handleCancel = (action: string) => {
        switch(action) {
            case 'editar':
                setIsModalOpenEdit(false);
                break;
            case 'deletar':
                setIsModalOpenDelete(false);
                break;
            case 'criar':
                setIsModalOpenCreate(false);
                break;

            default:
                console.log('Ação desconhecida', action);
                break;
        }
    };

    const handleRowClick = (lineData: DataType) => {
        setRowData(lineData)
    };

    const onFinish = (values: any) => {
        console.log('Form submitted:', values);
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
            align: 'center',
        },
        {
            title: 'Nome do Produto',
            dataIndex: 'nome',
            key: 'nome',
            align: 'center',
        },
        {
            title: 'Qtd Estoque',
            dataIndex: 'estoque',
            key: 'estoque',
            align: 'center',
        },
        {
            title: 'Editar',
            dataIndex: 'editar',
            key: 'editar',
            align: 'center',
            render: () => <Button size='large' type="text" icon={<EditOutlined className="text-xl text-green-500" onClick={() => showModal('editar')} />}></Button>
        },
        {
            title: 'Deletar',
            dataIndex: 'deletar',
            key: 'deletar',
            align: 'center',
            render: () => <Button size='large' type="text" icon={<DeleteOutlined className="text-xl text-red-500" onClick={() => showModal('deletar')} />}></Button>
        },
    ];

    return(
        <Content className='p-[20px] h-[100%] w-[100%] rounded-xl bg-white flex flex-col items-start'>
            <Typography.Title level={5} className='text-xl text-red-700 font-bold flex gap-2'>
                <InboxOutlined/>
                Estoque
            </Typography.Title>

            <Row className='mt-10 w-[100%] flex flex-row justify-between'>
                <Space className='flex gap-4'>
                    <Input
                        size="middle"
                        placeholder="Pesquisar"
                        prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    />
                    <Button id="btnFiltro" className='bg-red-700' type='primary' icon={<FilterOutlined/>}>Filtrar</Button>
                </Space>

                <Space className=''>
                    <Button id='btnAdiciona' type='primary' icon={<PlusOutlined />} className='bg-red-700' onClick={() => showModal('criar')}>
                        Novo
                    </Button>
                </Space>
            </Row>

            <Col span={24} className='w-[100%] h-[95%]'>
                <Table
                    columns={columns}
                    dataSource={data}
                    size='large'
                    rowKey="codigo"
                    loading={loading}
                    pagination={false}
                    onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                    })}
                    style={{ marginBottom: '20px', marginTop: '20px' }}
                />
            </Col>

            <ModalScreen 
                title={`Apagar "${rowData?.nome}"`} 
                btnAction={'Apagar'} 
                isModalOpen={isModalOpenDelete} 
                loading={false} 
                handleCancel={() => handleCancel('deletar')}
                form={form}                
            >
                <Typography className='mt-8 mb-4'>Esta ação não poderá ser desfeita.</Typography>
            </ModalScreen>

            <ModalScreen 
                title={'Editar Estoque'} 
                btnAction={'Salvar'} 
                isModalOpen={isModalOpenEdit} 
                loading={false} 
                handleCancel={() => handleCancel('editar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    onFinish={onFinish}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Adicionar Novo'} 
                btnAction={'Salvar'} 
                isModalOpen={isModalOpenCreate} 
                loading={false} 
                handleCancel={() => handleCancel('criar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={null}
                    onFinish={onFinish}
                />

            </ModalScreen>
        </Content>
    )
}