import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import DonateForm from '../components/LendDonate/DonateForm';

export default function DonatePage(){
  return (
    <MainLayout>
      <div className="container">
        <DonateForm />
      </div>
    </MainLayout>
  );
}
