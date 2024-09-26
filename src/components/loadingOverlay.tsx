import React, { ReactNode } from 'react';
import { Spin } from 'antd';
import './custom.css';

interface OverlayLoadingType{
    isLoading: boolean;
    children: ReactNode;
}

const LoadingOverlay = ( {isLoading, children}: OverlayLoadingType ) => {
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
