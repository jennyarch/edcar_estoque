import { useEffect, useState } from 'react';

// Defina seu tipo de dados conforme necessário
interface Data {
	title: string;
	dataIndex: string;
	key: string;
	render: () => void;
}

const useFetchData = () => {
	const [data, setData] = useState<Data[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('http://localhost:3333/produtos');
				const result = await response.json();
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
