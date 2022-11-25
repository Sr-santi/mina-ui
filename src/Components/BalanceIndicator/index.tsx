import React, { ReactNode, useEffect, useState } from 'react';
import {
  AccountContainer,
  AccountName,
  BalanceContainerWrapper,
} from './styles';

interface Props {
  children?: ReactNode;
  operationExec: any;
  getAddresses: () => any;
  getBalance: (address) => any;
  isConnectedWallet: boolean;
}
// pending component
export default function BalanceContainer({
  children,
  operationExec,
  isConnectedWallet,
  getAddresses,
  getBalance,
}: Props) {
  const [Addresses, setAddresses] = useState({});
  const [Balance, setBalance] = useState({});

  useEffect(() => {
    async function getAllAddresses() {
      const addresses = await getAddresses();
      setAddresses(addresses);
    }
    if (isConnectedWallet) {
      getAllAddresses();
    }
  }, [isConnectedWallet]);
  // get balances, I need to update this always someone executes a windraw or a transfer
  useEffect(() => {
    
    const accountNames = Object.keys(Addresses);
    async function getBalances() {
      const objectBalance = {};
      for (const address of accountNames) {
        const userAccount = Addresses[address];
        const balance = await getBalance(userAccount);
        objectBalance[address] = balance;
      }
      setBalance(objectBalance);
    }
    if (accountNames.length > 0) {
      getBalances();
    }
  }, [Addresses]);
  useEffect(() => {
    setAddresses({ ...Addresses });
  }, [operationExec]);
  return (
    <BalanceContainerWrapper>
      {Object.keys(Balance).map((keyName, index) => (
        <AccountContainer key={`${index}_1`}>
          <AccountName key={`${index}_2`}>{keyName} :</AccountName>
          <div key={`${index}_3`}>{Balance?.[keyName]} MINA</div>
        </AccountContainer>
      ))}
    </BalanceContainerWrapper>
  );
}
