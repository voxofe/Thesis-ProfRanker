import React, { useState } from 'react';
import Form from './components/Form';
import Header from './components/Header';

export default function App() {

  const academicYear = "2024-2025"

  return (
    <div className="flex justify-center min-h-screen ">
      <div className="max-w-[1200px] px-20 py-7 ">
        <Header academicYear={academicYear}/>
        <Form academicYear={academicYear}/>
        {/* <Footer /> */}
      </div>
    </div>
  );
    

}
