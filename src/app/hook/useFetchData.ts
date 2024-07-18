import { useEffect, useState } from 'react';
interface DataType {
    key: number;
    codigo: string;
    nome: string;
    estoque: number;
}

const useFetchData = (): { data: DataType[], loading: boolean, error: Error | null } => {
	const [data, setData] = useState<DataType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:3333/produtos');
				const result: DataType[] = await response.json();
				setData(result);
			} catch (err) {
				setError(err as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return { data, loading, error };
};

export default useFetchData;
