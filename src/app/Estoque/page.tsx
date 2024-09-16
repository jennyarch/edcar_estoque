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

    const [loading, setLoading] = useState(false);
    const [loadingTable, setLoadingTable] = useState(false);

    const [form] = Form.useForm();
    const urlApi = 'http://localhost:3333';

    const showModal = (action: string) => {
        switch(action) {
            case 'editar':
                setIsModalOpenEdit(true);
                break;
            case 'deletar':
                setIsModalOpenDelete(true);
                break;
            case 'criar':
                setIsModalOpenCreate(true);
                form.resetFields()
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

        await axios.get(`${urlApi}/products`)
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
        setLoading(true);

        const body = newProduct;

        await axios.post(`${urlApi}/products`, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            setLoading(false);
            setIsModalOpenCreate(false);
            handleProducts()

            notification.success({
                message: 'Produto cadastrado com sucesso',
                duration: 10
            })
        })
        .catch(err => {
            setLoading(false);
            notification.error({
                message: 'Erro ao cadastrar produto',
                description: err.response.data,
                duration: 10
            })
        })
    };

    async function updateProduct(updateProduct: any){
        setLoading(true);

        const productId = updateProduct.id;
        const body = updateProduct;

        await axios.put(`${urlApi}/products/${productId}`, body, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(res => {
            setLoading(false);
            setIsModalOpenEdit(false);
            handleProducts()

            notification.success({
                message: 'Produto atualizado com sucesso',
                duration: 10
            })
        })
        .catch(err => {
            setLoading(false);
            notification.error({
                message: 'Erro ao atualizar produto',
                description: err.response.data,
                duration: 10
            })
        })
    }

    async function deleteProduct(product: any): Promise<void> {
        setLoading(true);

        await axios.delete(`${urlApi}/products/${product.id}`)
        .then(res => {
            setIsModalOpenDelete(false)
            handleProducts()
            notification.success({
                message: 'Produto deletado com sucesso',
                duration: 10
            })
        })
        .catch(err => {
            notification.error({
                message: 'Erro ao tentar deletar produto',
                description: err.message,
                duration: 10
            })
        })
        .finally(() => {
            setLoading(false);
        })
    
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
    },[])

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
                    pagination={{
                        pageSize: 5,
                        defaultCurrent: 1,
                    }}
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
                loading={loading}
                handleCancel={() => handleCancel('deletar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    isDelete={true}
                    onFinish={deleteProduct}
                />

                <Typography className='mt-[-20px] mb-4'>Esta ação não poderá ser desfeita.</Typography>
            </ModalScreen>

            <ModalScreen 
                title={'Editar Estoque'} 
                btnAction={'Salvar'} 
                isModalOpen={isModalOpenEdit} 
                loading={loading} 
                handleCancel={() => handleCancel('editar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    isDelete={false}
                    onFinish={updateProduct}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Adicionar Novo'}
                btnAction={'Salvar'} 
                isModalOpen={isModalOpenCreate} 
                loading={loading} 
                handleCancel={() => handleCancel('criar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={null}
                    isDelete={false}
                    onFinish={addProduct}
                />

            </ModalScreen>
        </Content>
    )
}