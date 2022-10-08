import CardSection from '@Components/CardSection'
import LandingMainSection from '@Components/LandingMainSection'
import ScrollingText from '@Components/ScrollingText'
import type { NextPage } from 'next'
import Header from '../Components/Header'
import LadingLayout from '../Layouts/Lading'
import styles from '../styles/Home.module.scss'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <LadingLayout>
        <Header></Header>
        <LandingMainSection></LandingMainSection>
        <div className='w-1 h-1 my-20' />
        <ScrollingText title={'SpeeDao'} />
        <CardSection />
      </LadingLayout>
    </div>
  )
}

export default Home
