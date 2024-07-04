'use client';
import React, { useState, useEffect } from 'react';
import { Space, Typography, Col, Row, Input, Button, Table } from 'antd';
import { SearchOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import useFetchData from '../hook/useFetchData';

// interface Data{
//     title: string;
//     dataIndex: string;
//     key: string;
//     render: () => void;
// }

export default function Estoque(){

    const { data, loading, error } = useFetchData();

    console.log(data)

    const columns = [
        {
            title: 'Código',
            dataIndex: 'codigo',
            key: 'codigo',
            render: () => {
                return null;
            },
        },
        {
            title: 'Nome do Produto',
            dataIndex: 'nome',
            key: 'codigo',
            render: () => {
                return null;
            },
        },
        {
            title: 'Qtd Estoque',
            dataIndex: 'estoque',
            key: 'codigo',
            render: () => {
                return null;
            },
        },
    ]

    return(
        <Content className='p-[20px] h-[100%] w-[100%] rounded-xl bg-white flex flex-col items-start'>
            <Typography.Title level={5}>
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
                    <Button id='btnAdiciona' type='primary' icon={<PlusOutlined />} className='bg-red-700'>
                        Novo
                    </Button>
                </Space>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        size='large'
                        rowKey="key"
                        style={{ marginBottom: '20px'}}
                    />
                </Col>
                </Row>
        </Content>
    )
}