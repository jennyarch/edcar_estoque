import React, { useState, useEffect } from 'react';
import { Space, Typography, Col, Row } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export default function Estoque(){

    return(
        <Space className='p-[20px] h-[100%] w-[100%] rounded-lg bg-white flex items-start'>
            <Typography.Title level={5} className='text-xl text-red-700 font-bold flex gap-2'>
                <HomeOutlined/>
                Início
            </Typography.Title>
        </Space>
    )
}