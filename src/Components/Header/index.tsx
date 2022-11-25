/* eslint-disable @next/next/no-img-element */
import React, { ReactNode, useState, useEffect } from 'react';
import BalanceContainer from '../BalanceIndicator';
import {
  HeaderContainer,
  HeaderLogo,
  HeaderLogoContainer,
  HeaderWrapper,
} from './styles';

interface Props {
  children?: ReactNode;
  operationExec: any;
  isConnectedWallet: boolean;
  getAddresses: () => any;
  getBalance: (address) => any;
}

export default function Header({
  children,
  operationExec,
  isConnectedWallet,
  getAddresses,
  getBalance,
}: Props) {
  // const handleClick = () => {
  //   
  // };
  return (
    <>
      <HeaderContainer>
        <HeaderWrapper>
          <HeaderLogoContainer>
            {/* put a degrade */}
            <HeaderLogo>
              {/* <img src="/harpo_logo.svg" alt="logo" /> */}
            </HeaderLogo>
          </HeaderLogoContainer>
          {isConnectedWallet && (
            <BalanceContainer
              operationExec={operationExec}
              getAddresses={getAddresses}
              getBalance={getBalance}
              isConnectedWallet={isConnectedWallet}
            />
          )}
        </HeaderWrapper>
      </HeaderContainer>
    </>
  );
}
