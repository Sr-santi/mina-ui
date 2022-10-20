/* eslint-disable @next/next/no-img-element */
import ActionButton from '@Components/ActionButton';
import React, { ReactNode, useState, useEffect } from 'react';
import { HeaderContainer, HeaderLogo, HeaderLogoContainer, HeaderWrapper } from './styles';
import {MixerZkApp} from 'mina-smart-contract'

interface Props {
  children?: ReactNode;
}

export default function Header({ children }: Props) {
  // const handleClick = () => {
  //   console.log('Click happened');
  // };
  return (
    <React.Fragment>
      <HeaderContainer className="px-12">
        <HeaderWrapper>
          <HeaderLogoContainer>
            {/* put a degrade */}
            <HeaderLogo>
              <img src="/harpo_logo.svg" alt="logo" />
            </HeaderLogo>
          </HeaderLogoContainer>
        </HeaderWrapper>
      </HeaderContainer>
    </React.Fragment>
  );
}
