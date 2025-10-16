import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import SubPage1 from './pages/SubPage1';
import SubPage2 from './pages/SubPage2';
import SubPage3 from './pages/SubPage3';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/sub1" element={<SubPage1 />} />
      <Route path="/sub2" element={<SubPage2 />} />
      <Route path="/sub3" element={<SubPage3 />} />
    </Routes>
  );
}