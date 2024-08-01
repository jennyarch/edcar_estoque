"use client"
import React, { useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

type ProtectedRouteProps = {
	children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const router = useRouter();

	useEffect(() => {
		if(!authService.isAuthenticated()){
			router.push('/Login');
		}
	}, [router]);

	if(!authService.isAuthenticated()){
		return null;
	}

	return <>{children}</>;
};

export default ProtectedRoute;