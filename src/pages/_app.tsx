import type { AppProps } from 'next/app'
import React, { useCallback, useEffect, useState } from 'react';
import {MixerZkApp} from 'mina-smart-contract'
import '../styles/globals.scss'
import "../styles/tailwind.scss"
// some style params
let grey = '#cccccc';
let darkGrey = '#999999';
let lightGrey = '#f6f6f6';
let thin = `${grey} solid 1px`;
let gridWidth = 450;
let Mixer:any;

function MyApp({ Component, pageProps }: AppProps) {
  let [zkapp, setZkapp] = useState();
  return <Component {...pageProps} />
}

function DeployContract(setZkapp:any ) {
  let [isLoading, setLoading] = useState(false);
  async function deploy() {
    if (isLoading) return;
    setLoading(true);
    Mixer = await 'mina-smart-contract';
    let zkapp = await Mixer.deploy();
    setLoading(false);
    setZkapp(zkapp);
  }
  return (
    <Layout>
      <Header>Step 1: Deploy the contract</Header>

      <Button onClick={deploy} disabled={isLoading}>
        Deploy
      </Button>
      <div style={{ padding: 12 }}><i>Please wait ~30s for the proof to generate</i></div>
    </Layout>
  );

function Header( children:any) {
  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ fontSize: '36px', textAlign: 'center' }}>{children}</h1>
    </div>
  );
}
function Layout( children:any ) {
  let [header, left, right] = children;
  return (
    <>
      {header}
      <Space h="4rem" />
      <div style={{ display: 'flex' }}>
        {left}
        <Space w="4rem" />
        {right}
      </div>
    </>
  );
}
function Space(w:any, h:any ) {
  return <div style={{ width: w, height: h }} />;
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
export default MyApp
