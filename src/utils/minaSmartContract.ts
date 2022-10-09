// 1. import SmartContract from Mina (npm package)
import { MixerZkApp } from 'mina-smart-contract';
import React from 'react';
// 2. import functions, datatypes and more from snarkyjs
import { Bool, isReady, Mina, AccountUpdate, PrivateKey, shutdown } from 'snarkyjs';

export async function connectSM(setAccount: React.SetStateAction<any>) {
  try {
    // setup
    await isReady; //wait until snarky is ready
    // create local instance of MINA
    const Local = Mina.LocalBlockchain();
    // init the MINA instance
    Mina.setActiveInstance(Local);
    // get test accounts
    const account1 = Local.testAccounts[0].privateKey;
    const zkappKey = PrivateKey.random();
    let zkappAddress = zkappKey.toPublicKey();
    // create an instance of the smart contract
    let zkapp = new MixerZkApp(zkappAddress);

    console.log('Deploying Mixer...');
    console.log('this is the account: ', account1);
    setAccount(account1);
    // this enable the smartContract , can take between 20s or a couple minutes
    await MixerZkApp.compile();
    let tx = await Mina.transaction(account1, () => {
      AccountUpdate.fundNewAccount(account1);
      let zkapp = new MixerZkApp(zkappAddress);
      zkapp.deploy({ zkappKey });
      /* zkapp.x.set();
        zkapp.sudokuHash.set(sudokuInstance.hash());
        zkapp.isSolved.set(Bool(false)); */
    });
  } catch (error) {
    console.error(error);
  }
}
