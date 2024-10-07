import { Space, Row, Col, Typography, Badge, Avatar } from "antd";
import { DropboxOutlined } from "@ant-design/icons";

interface CardsProps {
    data?: any[];
    title: string;
}

const Cards: React.FC<CardsProps> = ({ data, title }) => {
    return(
        <Row className='mt-5'>
            <Col span={24}>
                <Space className='flex flex-row justify-around items-center'>
                    <Badge count={data ? data.length : 0} showZero>
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
                        {title}
                    </Typography>
                </Space>
            </Col>
        </Row>
    )
}

export default Cards;