import ActionButton from '@Components/ActionButton';
import React, { ReactNode,useState } from 'react';
import { LandingMainSectionContainer, SubTitle, Title } from './styles';
import {MixerZkApp} from 'mina-smart-contract'
interface Props {
  children?: ReactNode;
}
// some style params
let grey = '#cccccc';
let darkGrey = '#999999';
let lightGrey = '#f6f6f6';
let thin = `${grey} solid 1px`;
let Mixer:any;
export default function LandingMainSection({ children }: Props) {
  let [zkapp, setZkapp] = useState();
  function DeployContract(setZkapp:any ) {
    
  async function deploy() {
    let [isLoading, setLoading] = useState(false);
    if (isLoading) return;
    setLoading(true);
    Mixer = await 'mina-smart-contract';
    let zkapp = await Mixer.deploy();
    setLoading(false);
    setZkapp(zkapp);
  }
  return (
    <React.Fragment>
      <LandingMainSectionContainer>
        <SubTitle>Your privacy protector</SubTitle>
        <br />
        <Button onClick={deploy} disabled={isLoading}>
        Deploy
      </Button>
        {/* <CircleImage position={2} direction={1} image={2} size={300} />
            <CircleImage position={3} direction={4} image={3} size={250} opacity={0.5} />
            <CircleImage position={4} direction={2} image={1} size={150} /> */}
      </LandingMainSectionContainer>
    </React.Fragment>
  );
}

  function Button({ disabled = false, ...props }) {
    return (
      <button
        className="highlight"
        style={{
          color: disabled ? darkGrey : 'black',
          fontSize: '1rem',
          fontWeight: 'bold',
          backgroundColor: disabled ? 'white !important' : 'white',
          borderRadius: '10px',
          paddingTop: '10px',
          paddingBottom: '10px',
          width: '100%',
          border: disabled ? `4px ${darkGrey} solid` : '4px black solid',
          boxShadow: `${grey} 3px 3px 3px`,
          cursor: disabled ? undefined : 'pointer',
        }}
        disabled={disabled}
        {...props}
      />
    );
  }
}
