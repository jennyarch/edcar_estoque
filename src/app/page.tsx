"use client"
import React, { useState, ReactNode, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { MenuSideBar } from './components/menuSideBar';

export default function Home(){

	return (
		<ProtectedRoute>
			<MenuSideBar/>
		</ProtectedRoute>
	);
}