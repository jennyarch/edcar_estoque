'use client';
import React, { useState, useEffect } from 'react';
import {
    Space,
    Layout,
    Typography,
    Col,
    Row,
    Input,
    Button,
    Table,
    Form,
    notification,
    Dropdown,
    MenuProps,
    Tooltip
} from "antd";
import {
    SearchOutlined,
    FilterOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    InboxOutlined,
    DollarOutlined
} from "@ant-design/icons";
import ModalScreen from '../../components/modalScreen';
import type { ColumnsType } from 'antd/es/table';
import FormScreen from '../../components/formScreen';
import { formatterReal } from '@/utils/formattersTable';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useProducts } from '@/context/ProductsProvider';

const { Content } = Layout;

interface DataType {
    id: string;
    codigo: string;
    nome: string;
    qtdEstoque: string;
    valor: number;
}

export default function Estoque() {

    const [rowId, setRowId] = useState<DataType | null>(null);
    const [rowData, setRowData] = useState<DataType | null>(null);
    const [filterText, setFilterText] = useState('');
    const [keySelected, setKeySelected] = useState('nome');

    const [modalOpen, setModalOpen] = useState({
        modalCreate: false,
        modalEdit: false,
        ModalDelete: false,
        modalSell: false
    });

    const [loading, setLoading] = useState(false);

    const [form] = Form.useForm();

    const { products, setProducts, loadingProducts, handleProducts } = useProducts();

    const showModal = (action: string) => {
        switch(action) {
            case 'editar':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalEdit: true
                }))
                break;
            case 'deletar':
                setModalOpen(prevState => ({
                    ...prevState,
                    ModalDelete: true
                }))
                break;
            case 'criar':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalCreate: true
                }))
                form.resetFields()
                break;
            case 'venda':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalSell: true
                }))
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
                setModalOpen(prevState => ({
                    ...prevState,
                    modalEdit: false
                }))
                break;
            case 'deletar':
                setModalOpen(prevState => ({
                    ...prevState,
                    ModalDelete: false
                }))
                break;
            case 'criar':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalCreate: false
                }))
                break;
            case 'venda':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalSell: false
                }))
                break;
            default:
                console.log('Ação desconhecida', action);
                break;
        }
    };

    const handleRowClick = (lineData: DataType) => {
        setRowData(lineData)
    };

    async function addProduct(newProduct: any) {
        setLoading(true);

        const valueFormatted = newProduct.valor?.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorFormatted = parseFloat(valueFormatted);

        const body = {
            codigo: newProduct.codigo,
            nome: newProduct.nome,
            qtdEstoque: newProduct.qtdEstoque,
            valor: valorFormatted
        };

        try {
            await addDoc(collection(db, "products"), body);
            setLoading(false);
            setModalOpen(prevState => ({
                ...prevState,
                modalCreate: false
            }))
            handleProducts();
    
            notification.success({
                message: 'Produto cadastrado com sucesso',
                duration: 10
            });
        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao cadastrar produto',
                    description: err.message,
                    duration: 10
                });
            }else{
                notification.error({
                    message: 'Erro ao carregar dados do usuário',
                    description: 'Erro desconhecido',
                    duration: 10
                });
            }
        } finally {
            setLoading(false);
        }
    };

    async function updateProduct(updateProduct: DataType){
        setLoading(true);
        let valorFormatted = updateProduct.valor;

        if(rowData?.valor !== updateProduct.valor){
            const valueFormatted = String(updateProduct.valor).replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            valorFormatted = parseFloat(valueFormatted);
        }

        const productId = rowId?.id;

        if (!productId) {
            notification.info({
                message: "O ID do produto é necessário para a atualização.",
                duration: 10
            });
            setLoading(false);
            return;
        }

        try {
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, {
                codigo: updateProduct.codigo,
                nome: updateProduct.nome,
                qtdEstoque: updateProduct.qtdEstoque,
                valor: valorFormatted
            });
            
            setLoading(false);
            setModalOpen(prevState => ({
                ...prevState,
                modalEdit: false
            }))
            handleProducts();

            notification.success({
                message: 'Produto atualizado com sucesso',
                duration: 10
            });
        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao atualizar produto',
                    description: err.message,
                    duration: 10
                });
            }else{
                notification.error({
                    message: 'Erro ao carregar dados do usuário',
                    description: 'Erro desconhecido',
                    duration: 10
                });
            }
        }finally{
            setLoading(false);
        }
    };

    async function handleSellProduct(products: any) {
        setLoading(true);

        const quantitySold = parseInt(products.venda);

        const productId = rowId?.id;

        if (!productId) {
            notification.info({
                message: "O ID do produto é necessário para a atualização.",
                duration: 10
            });
            setLoading(false);
            return;
        }
    
        try {
            const productRef = doc(db, "products", productId);
            const productSnapshot = await getDoc(productRef);
    
            const productData = productSnapshot.data() as DataType;
    
            if (parseInt(productData.qtdEstoque) < quantitySold) {
                notification.error({
                    message: 'Estoque insuficiente.',
                    description: `Quantidades em estoque: ${productData.qtdEstoque}`,
                    duration: 10,
                });
                setLoading(false);
                return;
            }
    
            const updatedQtdEstoque = parseInt(productData.qtdEstoque) - quantitySold;
    
            await updateDoc(productRef, {
                qtdEstoque: String(updatedQtdEstoque),
            });

            handleProducts();
            setModalOpen(prevState => ({
                ...prevState,
                modalSell: false
            }))
    
            notification.success({
                message: 'Venda realizada com sucesso.',
                description: `Quantidade restante em estoque: ${updatedQtdEstoque}`,
                duration: 10,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                notification.error({
                    message: 'Erro ao processar a venda',
                    description: err.message,
                    duration: 10,
                });
            } else {
                notification.error({
                    message: 'Erro desconhecido ao processar a venda',
                    duration: 10,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    async function deleteProduct() {
        setLoading(true);

        const idProduct = rowId?.id;

        if (!idProduct) {
            notification.info({
                message: "O ID do produto é necessário para a exclusão.",
                duration: 10
            });
            setLoading(false);
            return;
        }

        try {
            const productRef = doc(db, "products", idProduct);
            await deleteDoc(productRef);
            
            setModalOpen(prevState => ({
                ...prevState,
                ModalDelete: false
            }))
            handleProducts();
    
            notification.success({
                message: 'Produto deletado com sucesso',
                duration: 10
            });
        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao tentar deletar produto',
                    description: err.message,
                    duration: 10
                });
            }else{
                notification.error({
                    message: 'Erro ao carregar dados do usuário',
                    description: 'Erro desconhecido',
                    duration: 10
                });
            }
            
        } finally {
            setLoading(false);
        }
    
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value.toLowerCase();
        setFilterText(searchValue);

        if(searchValue === ''){
            handleProducts()
        }else{
            const filteredData = products?.filter((item) => {
                if(keySelected === 'nome'){
                    return item.nome.toLowerCase().includes(searchValue)
                }

                if(keySelected === 'código'){
                    return item.codigo.includes(searchValue)
                }

                return false;
            });
            setProducts(filteredData);
        }
    };

    const items: MenuProps['items'] = [
        {
            label: 'Nome',
            key: 'nome'
        },
        {
            label: 'Código',
            key: 'código'
        }
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        setKeySelected(e.key);
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
            title: (
                <Space className='flex flex-row justify-center'>
                    <Typography>Código</Typography>
                    {keySelected === 'código' && 
                        <Tooltip title={`Busca por ${keySelected}`}>
                            <FilterOutlined className='text-red-700'/>
                        </Tooltip>
                    }
                </Space>
            ),
            dataIndex: 'codigo',
            key: 'codigo',
            align: 'center',
        },
        {
            title: (
                <Space className='flex flex-row justify-center'>
                    <Typography>Nome do Produto</Typography>
                    {keySelected === 'nome' && 
                        <Tooltip title={`Busca por ${keySelected}`}>
                            <FilterOutlined className='text-red-700'/>
                        </Tooltip>
                    }
                </Space>
            ),
            dataIndex: 'nome',
            key: 'nome',
            align: 'center',
        },
        {
            title: 'Valor(Unitário)',
            dataIndex: 'valor',
            key: 'valor',
            align: 'center',
            render: (value, dados) => (
                <Typography>
                    {formatterReal(value)}
                </Typography>
            )
        },
        {
            title: 'Qtd Estoque',
            dataIndex: 'qtdEstoque',
            key: 'qtdEstoque',
            align: 'center',
        },
        {
            title: 'Ações',
            dataIndex: 'acao',
            key: 'acao',
            align: 'center',
            render: (text, dados) => (
                <Space className='flex flex-row gap-2 justify-center align-baseline'>
                    <Button 
                        size='large' 
                        type="text" 
                        icon={<EditOutlined className="text-xl text-yellow-500" />}
                        onClick={() => {
                            showModal('editar')
                            setRowId(dados)
                        }}
                    />
                    <Button 
                        size='large' 
                        type="text" 
                        icon={<DeleteOutlined className="text-xl text-red-500" />}
                        onClick={() => {
                            showModal('deletar')
                            setRowId(dados)
                        }} 
                    />
                    <Button 
                        size='large' 
                        type="text" 
                        icon={<DollarOutlined className="text-xl text-green-500" />}
                        onClick={() => {
                            showModal('venda')
                            setRowId(dados)
                        }} 
                    />
                </Space>
            )
        },
    ];

    useEffect(() => {
        handleProducts()
    },[]);

    const { modalCreate, modalEdit, ModalDelete, modalSell } = modalOpen;

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
                        value={filterText}
                        onChange={handleSearch}
                    />
                    <Dropdown 
                        menu={{ 
                            items,
                            selectable: true,
                            defaultSelectedKeys: [keySelected],
                            onClick: handleMenuClick,
                        }} 
                        trigger={['click']}
                    >
                        <Button id="btnFiltro" className='bg-red-700' type='primary' icon={<FilterOutlined/>}>Filtrar por</Button>
                    </Dropdown>
                </Space>

                <Space className=''>
                    <Button id='btnAdiciona' type='primary' icon={<PlusOutlined />} className='bg-red-700' onClick={() => showModal('criar')}>
                        Novo Produto
                    </Button>
                </Space>
            </Row>

            <Col span={24} className='w-[100%] h-[95%]'>
                <Table
                    columns={columns}
                    dataSource={products}
                    size='large'
                    rowKey="id"
                    loading={loadingProducts}
                    pagination={{
                        pageSize: 100,
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
                isModalOpen={ModalDelete} 
                loading={loading}
                handleCancel={() => handleCancel('deletar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    isDelete={true}
                    isSell={false}
                    onFinish={deleteProduct}
                />

                <Typography className='mt-[-20px] mb-4'>Esta ação não poderá ser desfeita.</Typography>
            </ModalScreen>

            <ModalScreen 
                title={'Editar Estoque'} 
                btnAction={'Salvar'} 
                isModalOpen={modalEdit} 
                loading={loading} 
                handleCancel={() => handleCancel('editar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    isDelete={false}
                    isSell={false}
                    onFinish={updateProduct}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Adicionar Novo'}
                btnAction={'Adicionar'} 
                isModalOpen={modalCreate} 
                loading={loading} 
                handleCancel={() => handleCancel('criar')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={null}
                    isDelete={false}
                    isSell={false}
                    onFinish={addProduct}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Venda do Produto'}
                btnAction={'Confirmar Venda'} 
                isModalOpen={modalSell} 
                loading={loading} 
                handleCancel={() => handleCancel('venda')}
                form={form}                
            >
                <FormScreen
                    form={form}
                    formValues={rowData}
                    isDelete={true}
                    isSell={true}
                    onFinish={handleSellProduct}
                />

            </ModalScreen>
        </Content>
    )
}