import ActionButton from '@Components/ActionButton';
import React, { ReactNode } from 'react';
import CircleImage from './CircleImage';
import { LandingMainSectionContainer, SubTitle, Title } from './styles';

interface Props {
  children?: ReactNode;
}

export default function LandingMainSection({ children }: Props) {
  return (
    <React.Fragment>
        <LandingMainSectionContainer>
            <Title time={"2s"} >Boost up your <span>DAO</span></Title>
            <Title time={"1.5s"} reverse>Boost up your <span>Dream</span></Title>
            <SubTitle>Enable your DAO seamless read, interact and vote from Discord</SubTitle>
            <br />
            <ActionButton text={"Add to your Discord"} size="medium" arrow/>
            <CircleImage position={2} direction={1} image={2} size={300} />
            <CircleImage position={3} direction={4} image={3} size={250} opacity={0.5} />
            <CircleImage position={4} direction={2} image={1} size={150} />
        </LandingMainSectionContainer>
    </React.Fragment>
  );
}