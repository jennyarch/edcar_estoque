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
    Tooltip,
    List
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

import type { ColumnsType } from 'antd/es/table';
import dynamic from 'next/dynamic';
import { formatterReal } from '@/utils/formattersTable';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useParts } from '@/context/PartsProvider';

const ModalScreen = dynamic(() => import('../../components/modalScreen'), {
    ssr: false,
    loading: () => <p>Carregando...</p>
});

const FormScreen = dynamic(() => import('../../components/formScreen'), {
    ssr: false,
    loading: () => <p>Carregando...</p>
});

const { Content } = Layout;

interface DataType {
    id: string;
    codigo: string;
    nome: string;
    modelo: string;
    descricao: string;
    medidas: string;
    qtdEstoque: string;
    valor: number;
}

export default function Pecas(){

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

    const [formCreate] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [formDelete] = Form.useForm();
    const [formSell] = Form.useForm();

    const { parts, setParts, loadingParts, handleParts } = useParts();

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
                formCreate.resetFields()
                break;
            case 'baixa':
                setModalOpen(prevState => ({
                    ...prevState,
                    modalSell: true
                }))
                formSell.resetFields()
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
            case 'baixa':
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

    async function addPart(newPart: any) {
        setLoading(true);

        const valueFormatted = newPart.valor?.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
        const valorFormatted = parseFloat(valueFormatted);

        const body = {
            codigo: newPart.codigo,
            nome: newPart.nome,
            modelo: newPart.modelo,
            descricao: newPart.descricao !== '' ? newPart.descricao : null,
            medidas: newPart.medidas,
            qtdEstoque: newPart.qtdEstoque,
            valor: valorFormatted
        };

        try {
            await addDoc(collection(db, "parts"), body);
            setLoading(false);
            setModalOpen(prevState => ({
                ...prevState,
                modalCreate: false
            }))
            handleParts();
    
            notification.success({
                message: 'Peça cadastrado com sucesso',
                duration: 10
            });
        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao cadastrar peça',
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

    async function updatePart(updatePart: DataType){
        setLoading(true);
        let valorFormatted = updatePart.valor;

        if(rowData?.valor !== updatePart.valor){
            const valueFormatted = String(updatePart.valor).replace('R$ ', '').replace(/\./g, '').replace(',', '.');
            valorFormatted = parseFloat(valueFormatted);
        }

        const partId = rowId?.id;

        if (!partId) {
            notification.info({
                message: "O ID do produto é necessário para a atualização.",
                duration: 10
            });
            setLoading(false);
            return;
        }

        try {
            const partRef = doc(db, "parts", partId);
            await updateDoc(partRef, {
                codigo: updatePart.codigo,
                nome: updatePart.nome,
                qtdEstoque: updatePart.qtdEstoque,
                valor: valorFormatted
            });
            
            setLoading(false);
            setModalOpen(prevState => ({
                ...prevState,
                modalEdit: false
            }))
            handleParts();

            notification.success({
                message: 'Peça atualizado com sucesso',
                duration: 10
            });
        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao atualizar peça',
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

    async function handleSellPart(parts: any) {
        setLoading(true);

        const quantitySold = parseInt(parts.baixa);

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
            const productRef = doc(db, "parts", productId);
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

            handleParts();
            setModalOpen(prevState => ({
                ...prevState,
                modalSell: false
            }))
    
            notification.success({
                message: 'Baixa realizada com sucesso.',
                description: `Quantidade restante em estoque: ${updatedQtdEstoque}`,
                duration: 10,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                notification.error({
                    message: 'Erro ao processar a baixa',
                    description: err.message,
                    duration: 10,
                });
            } else {
                notification.error({
                    message: 'Erro desconhecido ao processar a baixa',
                    duration: 10,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    async function deletePart() {
        setLoading(true);

        const idPart = rowId?.id;

        if (!idPart) {
            notification.info({
                message: "O ID do produto é necessário para a exclusão.",
                duration: 10
            });
            setLoading(false);
            return;
        }

        try {
            const partRef = doc(db, "parts", idPart);
            await deleteDoc(partRef);
            
            setModalOpen(prevState => ({
                ...prevState,
                ModalDelete: false
            }))
            handleParts();
    
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
            handleParts()
        }else{
            const filteredData = parts?.filter((item) => {
                if(keySelected === 'nome'){
                    return item.nome.toLowerCase().includes(searchValue)
                }

                if(keySelected === 'código'){
                    return item.codigo.includes(searchValue)
                }

                return false;
            });
            setParts(filteredData);
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
        },
        {
            label: 'Modelo',
            key: 'modelo'
        },
        {
            label: 'Medidas',
            key: 'medidas'
        },
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
            title: (
                <Space className='flex flex-row justify-center'>
                    <Tooltip title="Modelo do carro que o diafragma suporta">
                        <Typography>Modelo</Typography>
                    </Tooltip>
                    {keySelected === 'modelo' && 
                        <Tooltip title={`Busca por ${keySelected}`}>
                            <FilterOutlined className='text-red-700'/>
                        </Tooltip>
                    }
                </Space>
            ),
            dataIndex: 'modelo',
            key: 'modelo',
            align: 'center',
            width: 150,
            render: (text: string, dados: any) => (
                text.includes(',') ? (
                    <List
                        size="small"
                        bordered
                        dataSource={text.split(',')}
                        renderItem={(item: string) => <List.Item>{item}</List.Item>}
                    />
                ) : (
                    <Typography.Text>{text}</Typography.Text>
                )
            )
        },
        {
            title: (
                <Space className='flex flex-row justify-center'>
                    <Typography>Descrição</Typography>
                    {keySelected === 'descrição' && 
                        <Tooltip title={`Busca por ${keySelected}`}>
                            <FilterOutlined className='text-red-700'/>
                        </Tooltip>
                    }
                </Space>
            ),
            dataIndex: 'descricao',
            key: 'descricao',
            align: 'center',
            render: (text, dados) => (
                <Typography>{text !== null ? text : '-'}</Typography>
            )
        },
        {
            title: (
                <Space className='flex flex-row justify-center'>
                    <Typography>Medidas(mm)</Typography>
                    {keySelected === 'medidas' && 
                        <Tooltip title={`Busca por ${keySelected}`}>
                            <FilterOutlined className='text-red-700'/>
                        </Tooltip>
                    }
                </Space>
            ),
            dataIndex: 'medidas',
            key: 'medidas',
            align: 'center',
            render: (text, dados) => (
                <Typography>
                    {text}mm
                </Typography>
            )
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
                            showModal('baixa')
                            setRowId(dados)
                        }} 
                    />
                </Space>
            )
        },
    ];

    useEffect(() => {
        const fetchParts = async () => {
            try {
                await handleParts();
            } catch (err: unknown) {
                if(err instanceof Error){
                    notification.error({
                        message: 'Erro ao carregar os peças',
                        description: err.message || 'Erro desconhecido'
                    });
                }else{
                    notification.error({
                        message: 'Erro ao carregar dados do usuário',
                        description: 'Erro desconhecido',
                        duration: 10
                    });
                }
            }
        };
        fetchParts();
    },[]);

    const { modalCreate, modalEdit, ModalDelete, modalSell } = modalOpen;

    return(
        <Content className='p-[20px] h-[100%] w-[100%] rounded-xl bg-white flex flex-col items-start'>
            <Typography.Title level={5} className='text-xl text-red-700 font-bold flex gap-2'>
                <InboxOutlined/>
                Peças de Reposição e Reparo(Hidrovácuo)
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
                    dataSource={parts}
                    size='large'
                    rowKey="id"
                    loading={loadingParts}
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
                form={formDelete}                
            >
                <FormScreen
                    form={formDelete}
                    formValues={rowData}
                    isDelete={true}
                    isSell={false}
                    isDiafragma={false}
                    onFinish={deletePart}
                />

                <Typography className='mt-[-20px] mb-4'>Esta ação não poderá ser desfeita.</Typography>
            </ModalScreen>

            <ModalScreen 
                title={'Editar Estoque'} 
                btnAction={'Salvar'} 
                isModalOpen={modalEdit} 
                loading={loading} 
                handleCancel={() => handleCancel('editar')}
                form={formEdit}                
            >
                <FormScreen
                    form={formEdit}
                    formValues={rowData}
                    isDelete={false}
                    isSell={false}
                    isDiafragma={false}
                    onFinish={updatePart}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Adicionar Novo'}
                btnAction={'Adicionar'} 
                isModalOpen={modalCreate} 
                loading={loading} 
                handleCancel={() => handleCancel('criar')}
                form={formCreate}                
            >
                <FormScreen
                    form={formCreate}
                    formValues={null}
                    isDelete={false}
                    isSell={false}
                    isDiafragma={false}
                    onFinish={addPart}
                />

            </ModalScreen>

            <ModalScreen 
                title={'Baixa do Produto'}
                btnAction={'Confirmar Baixa'} 
                isModalOpen={modalSell} 
                loading={loading} 
                handleCancel={() => handleCancel('baixa')}
                form={formSell}                
            >
                <FormScreen
                    form={formSell}
                    formValues={rowData}
                    isDelete={true}
                    isSell={true}
                    isDiafragma={false}
                    onFinish={handleSellPart}
                />

            </ModalScreen>
        </Content>
    )
}