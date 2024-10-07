"use client"
import React, { useEffect } from 'react';
import { Space, Typography, Col, Row, Badge, Avatar, Skeleton } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useProducts } from '@/context/ProductsProvider';
import Cards from './components/Cards';
import { useParts } from '@/context/PartsProvider';

export default function Estoque(){
    const { products, finishLoading, handleProducts } = useProducts();
    const { parts, finishLoading: loadingDone, handleParts } = useParts();

    useEffect(() => {
        handleProducts() 
        handleParts()
    }, []);

    return(
        finishLoading && loadingDone ? (
            <Skeleton className='mt-10' active/>
        ) : (
            <Space className='p-[20px] h-[100%] w-[100%] rounded-lg bg-white flex flex-col items-start'>
                <Row>
                    <Typography.Title level={5} className='text-xl text-red-700 font-bold flex gap-2'>
                        <HomeOutlined/>
                        Início
                    </Typography.Title>
                </Row>
                <Row className='mt-5'>
                    <Col span={24} className='flex gap-8'>
                        <Cards
                            data={products}
                            title='Diafragma'
                        />
                        <Cards
                            data={parts}
                            title='Peças(em geral)'
                        />
                    </Col>
                </Row>
            </Space>
        )
        
    )
}