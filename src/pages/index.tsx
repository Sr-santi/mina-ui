import CardSection from '@Components/CardSection';
import LandingMainSection from '@Components/LandingMainSection';
import type { NextPage } from 'next';
import { useEffect } from 'react';
import Header from '../Components/Header';
import LadingLayout from '../Layouts/Lading';
import styles from '../styles/Home.module.scss';
//import { MixerZkApp } from 'mina-smart-contract';
import TransactionCard from '@Components/TransactionCard';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <LadingLayout>
        <Header></Header>
        <LandingMainSection></LandingMainSection>
        <div className="w-1 h-1 my-5" />
        <TransactionCard></TransactionCard>
        {/* <ScrollingText title={'SpeeDao'} /> */}
        {/* <CardSection /> */}
      </LadingLayout>
    </div>
  );
};

export default Home;
