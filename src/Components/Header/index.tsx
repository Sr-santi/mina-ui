/* eslint-disable @next/next/no-img-element */
import React, { ReactNode, useState, useEffect } from 'react';
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
    <React.Fragment>
      <HeaderContainer>
        <HeaderWrapper>
          <HeaderLogoContainer>
            {/* put a degrade */}
            <HeaderLogo>
              {/* <img src="/harpo_logo.svg" alt="logo" /> */}
            </HeaderLogo>
          </HeaderLogoContainer>
        </HeaderWrapper>
      </HeaderContainer>
    </React.Fragment>
  );
}
