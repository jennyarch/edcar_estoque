import React, { ReactNode } from 'react';
import { Button, FormInstance, Modal, Typography } from 'antd';

interface ModalScreenProps {
    title: string;
    btnAction: string;
    isModalOpen: boolean;
    loading: boolean;
    handleCancel: () => void;
    form: FormInstance;
    children?: ReactNode;//O children em um componente React representa os elementos filhos que são passados entre as tags de abertura e fechamento do componente.
}

const ModalScreen: React.FC<ModalScreenProps> = ({ title, btnAction, isModalOpen, loading, handleCancel, form, children }) => {

    let styleBtnAction = btnAction === 'Salvar' ? 'bg-green-700 hover:!bg-green-600' : 'bg-red-500 hover:!bg-red-600';
    let styleTitle = btnAction === 'Salvar' ? 'text-green-700 text-lg' : 'text-red-500 text-lg';

    function handleOk(){
        form.submit()
    };

    function handleDelete(){
        console.log('deletando')
    };

    return (
        <Modal
            title={ (
                <Typography className={styleTitle}>{title}</Typography>
            ) } 
            open={isModalOpen} 
            onOk={handleOk} 
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Voltar
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={btnAction === 'Salvar' ? handleOk : handleDelete} className={styleBtnAction}>
                    {btnAction}
                </Button>,
            ]}
                
        >
            {children}
        </Modal>
    );
};

export default ModalScreen;