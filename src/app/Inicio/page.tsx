"use client"
import React, { useEffect } from 'react';
import { Space, Typography, Col, Row, Badge, Avatar, Skeleton } from 'antd';
import { HomeOutlined, DropboxOutlined } from '@ant-design/icons';
import { useProducts } from '@/context/ProductsProvider';

export default function Estoque(){
    const { products, finishLoading, handleProducts } = useProducts();

    useEffect(() => {
        handleProducts()
    }, []);

    return(
        finishLoading ? (
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
                    <Col span={24}>
                        <Space className='flex flex-row justify-around items-center'>
                            <Badge  count={products.length}>
                                <Avatar shape="square" size={{
                                        xs: 32,
                                        sm: 40,
                                        md: 40, 
                                        lg: 64,
                                        xl: 80, 
                                        xxl: 100 
                                    }}  className='bg-slate-300' icon={<DropboxOutlined className='text-blue-800 text-xxl'/>} />
                            </Badge>
                            <Typography className='text-lg font-semibold'>
                                Produtos
                            </Typography>
                        </Space>
                    </Col>
                </Row>
        </Space>
        )
        
    )
}