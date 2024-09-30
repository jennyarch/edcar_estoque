"use client"
import React, { useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/Auth';
import { Skeleton } from 'antd';

type ProtectedRouteProps = {
	children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const router = useRouter();
	const { isAuthenticated } = useAuth();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push('/Login');
		} else {
			setLoading(false);
		}
	}, [isAuthenticated, router]);

	if (loading) {
		return (
			<Skeleton active={loading} />
		)
	}

	return <>{children}</>;
};

export default ProtectedRoute;