import React, { ReactNode } from 'react';
import { Spin } from 'antd';
import './custom.css';

const LoadingOverlay = ( {isLoading}: {isLoading: boolean}, {children}: {children: ReactNode} ) => {
    return (
        <div>
            {isLoading && 
                <div className="overlay-spinner">
                    <Spin size='large'/>
                </div>
            }
            {children}
        </div>
    );
};

export default LoadingOverlay;
