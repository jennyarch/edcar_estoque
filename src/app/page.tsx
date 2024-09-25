"use client"
import ProtectedRoute from '../components/ProtectedRoute';
import { MenuSideBar } from '../components/menuSideBar';

export default function Home(){

	return (
		<ProtectedRoute>
			<MenuSideBar/>
		</ProtectedRoute>
	);
}