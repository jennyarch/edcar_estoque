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

interface ProductContextType {
    products: DataType[];
    setProducts: React.Dispatch<React.SetStateAction<DataType[]>>;
    handleProducts: () => void;
    loadingProducts: boolean;
    finishLoading: boolean;
}

const ProductsContext = createContext<ProductContextType>({} as ProductContextType);

export const useProducts = () => useContext(ProductsContext);

const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<DataType[]>([]);
    const [finishLoading, setFinishLoading] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const handleProducts = async () => {
        setLoadingProducts(true);

        try {
            const querySnapshot = await getDocs(collection(db, "products"));

            if(querySnapshot.empty){
                setProducts([])
                setFinishLoading(false)
                return
            }

            const products: DataType[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                codigo: doc.data().codigo,
                nome: doc.data().nome,
                modelo: doc.data().modelo,
                descricao: doc.data().descricao,
                medidas: doc.data().medidas,
                qtdEstoque: doc.data().qtdEstoque,
                valor: doc.data().valor,
            }));

            setProducts(products);
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
            setLoadingProducts(false);
        }
    };

    return (
        <ProductsContext.Provider value={{ products, setProducts, handleProducts, loadingProducts, finishLoading }}>
            {children}
        </ProductsContext.Provider>
    );
};

export { ProductsContext, ProductsProvider }


