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

    let styleBtnAction = '';
    let styleTitle = '';

    if(btnAction === 'Adicionar'){
        styleBtnAction = 'bg-red-500 hover:!bg-red-600';
        styleTitle = 'text-red-500 text-lg';
    }
    if(btnAction === 'Salvar'){
        styleBtnAction = 'bg-yellow-500 hover:!bg-yellow-600';
        styleTitle = 'text-yellow-500 text-lg';
    }
    if(btnAction === 'Apagar'){
        styleBtnAction = 'bg-red-500 hover:!bg-red-600';
        styleTitle = 'text-red-700 text-lg';
    }
    if(btnAction === 'Confirmar Baixa'){
        styleBtnAction = 'bg-green-500 hover:!bg-green-600';
        styleTitle = 'text-green-700 text-lg';
    }

    function handleOk(){
        form.submit()
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
                <Button key="submit" type="primary" loading={loading} onClick={handleOk} className={styleBtnAction}>
                    {btnAction}
                </Button>,
            ]}
                
        >
            {children}
        </Modal>
    );
};

export default ModalScreen;