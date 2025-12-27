import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import LendForm from '../components/LendDonate/LendForm';

export default function LendPage(){
  return (
    <MainLayout>
      <div className="container">
        <LendForm />
      </div>
    </MainLayout>
  );
}
