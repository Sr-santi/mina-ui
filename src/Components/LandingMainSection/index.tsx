import React, { ReactNode } from 'react';
import ActionButton from '../ActionButton';
import { LandingMainSectionContainer, SubTitle, Title } from './styles';

interface Props {
  children?: ReactNode;
  mainAction?: () => void;
  isDeployFinish: boolean;
}

export default function LandingMainSection({
  children,
  mainAction = () => {},
  isDeployFinish,
}: Props) {
  return (
    <React.Fragment>
      <LandingMainSectionContainer>
        <SubTitle>Your privacy protector</SubTitle>
        {/* <button onClick={}>Deploy</button> */}
        {!isDeployFinish && (
          <ActionButton
            action={mainAction}
            size="small"
            text="Deploy"
            disabled={isDeployFinish}
          ></ActionButton>
        )}
        <br />
        {/* <CircleImage position={2} direction={1} image={2} size={300} />
            <CircleImage position={3} direction={4} image={3} size={250} opacity={0.5} />
            <CircleImage position={4} direction={2} image={1} size={150} /> */}
      </LandingMainSectionContainer>
    </React.Fragment>
  );
}
