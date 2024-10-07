import React, { createContext, useState, useContext } from 'react';
import { notification } from 'antd';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

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

interface PartContextType {
    parts: DataType[];
    setParts: React.Dispatch<React.SetStateAction<DataType[]>>;
    handleParts: () => void;
    loadingParts: boolean;
    finishLoading: boolean;
}

const PartsContext = createContext<PartContextType>({} as PartContextType);

export const useParts = () => useContext(PartsContext);

const PartsProvider = ({ children }: { children: React.ReactNode }) => {
    const [parts, setParts] = useState<DataType[]>([]);
    const [finishLoading, setFinishLoading] = useState(true);
    const [loadingParts, setLoadingParts] = useState(false);

    const handleParts = async () => {
        setLoadingParts(true);

        try {
            const querySnapshot = await getDocs(collection(db, "parts"));

            if(querySnapshot.empty){
                setParts([])
                setFinishLoading(false)
                return
            }

            const parts: DataType[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                codigo: doc.data().codigo,
                nome: doc.data().nome,
                modelo: doc.data().modelo,
                descricao: doc.data().descricao,
                medidas: doc.data().medidas,
                qtdEstoque: doc.data().qtdEstoque,
                valor: doc.data().valor,
            }));

            setParts(parts);
            setFinishLoading(false)

        } catch (err: unknown) {
            if(err instanceof Error){
                notification.error({
                    message: 'Erro ao carregar dados',
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
        }finally {
            setLoadingParts(false);
        }
    };

    return (
        <PartsContext.Provider value={{ parts, setParts, handleParts, loadingParts, finishLoading }}>
            {children}
        </PartsContext.Provider>
    );
};

export { PartsContext, PartsProvider }


