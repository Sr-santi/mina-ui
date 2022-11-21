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
}

export default function Header({ children }: Props) {
  // const handleClick = () => {
  //   console.log('Click happened');
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
          <BalanceContainer />
        </HeaderWrapper>
      </HeaderContainer>
    </>
  );
}
