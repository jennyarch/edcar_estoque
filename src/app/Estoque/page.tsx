'use client';
import React, { useState, useEffect } from 'react';
import { Space, Layout, Typography, Col, Row, Input, Button, Table, Form, notification } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import ModalScreen from '../components/modalScreen';
// import useFetchData from '../hook/useFetchData';
import type { ColumnsType } from 'antd/es/table';
import FormScreen from '../components/formScreen';
import axios from 'axios';
import { headers } from 'next/headers';

const { Content } = Layout;

interface DataType {
    id: string;
    codigo: string;
    nome: string;
    qtdEstoque: string;
}

export default function Estoque() {

    // const { data, loading, error } = useFetchData();
    const [data, setData] = useState<DataType[]>([]);
    const [rowData, setRowData] = useState<DataType | null>(null);
    const [isModalOpenCreate, setIsModalOpenCreate] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);

    const [loadingTable, setLoadingTable] = useState(false);
    const [loadingBtnCreate, setLoadingBtnCreate] = useState(false)
    const [laodingBtnDelete, setLoadingBtnDelete] = useState(false);

    const [form] = Form.useForm();
    const urlApi = 'http://localhost:3333';

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

    async function handleProducts(){
        setLoadingTable(true);

        await axios.get(`${urlApi}/produtos`)
        .then(res => {
            setLoadingTable(false);
            setData(res.data)
        })
        .catch(err => {
            setLoadingTable(false);
            notification.error({
                message: 'Erro ao carregar dados',
                description: err.response.data,
                duration: 10
            })
        })
    };

    async function addProduct(newProduct: any) {
        setLoadingBtnCreate(true);

        const body = newProduct;

        await axios.post(`${urlApi}/produtos`, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            setLoadingBtnCreate(false);
            setIsModalOpenCreate(false);
            handleProducts()

            notification.success({
                message: 'Produto cadastrado com sucesso',
                duration: 10
            })
        })
        .catch(err => {
            setLoadingBtnCreate(false);
            notification.error({
                message: 'Erro ao cadastrar produto',
                description: err.response.data,
                duration: 10
            })
        })
    };

    async function deleteProduct(product: any): Promise<void> {
        setLoadingBtnDelete(true);

        const body = {
            id: product.id
        }
        
        try {
            await axios.delete(`${urlApi}/produtos`, {
                data: body
            });

            setLoadingBtnDelete(false);
            notification.success({
                message: 'Produto deletado com sucesso',
                duration: 10
            })

            } catch (error) {
            if (axios.isAxiosError(error)) {
                setLoadingBtnDelete(false);
                notification.error({
                    message: 'Erro ao deletar produto',
                    description: error.message,
                    duration: 10
                })
            } else {
                console.error('Unexpected error:', error);
            }
        }
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            hidden: true,
        },
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
            dataIndex: 'qtdEstoque',
            key: 'qtdEstoque',
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

    useEffect(() => {
        handleProducts()
    }, [])

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
                    rowKey="id"
                    loading={loadingTable}
                    pagination={false}
                    onRow={(record: DataType) => ({
                        onClick: () => handleRowClick(record),
                    })}
                    style={{ marginBottom: '20px', marginTop: '20px' }}
                />
            </Col>

            <ModalScreen 
                title={`Apagar "${rowData?.nome}"`} 
                btnAction={'Apagar'} 
                isModalOpen={isModalOpenDelete} 
                loading={laodingBtnDelete}
                handleCancel={() => handleCancel('deletar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    onFinish={deleteProduct}
                />

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
                    onFinish={addProduct}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Adicionar Novo'}
                btnAction={'Salvar'} 
                isModalOpen={isModalOpenCreate} 
                loading={loadingBtnCreate} 
                handleCancel={() => handleCancel('criar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={null}
                    onFinish={addProduct}
                />

            </ModalScreen>
        </Content>
    )
}