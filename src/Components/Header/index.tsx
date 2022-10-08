import ActionButton from '@Components/ActionButton';
import React, { ReactNode,useState,useEffect } from 'react';
import { HeaderContainer, HeaderLogo, HeaderLogoContainer, HeaderWrapper } from './styles';
import { SudokuZkApp } from 'sudoku'; //Linking the smart contract to consume it in the UI 


interface Props {
  children?: ReactNode;
}
useEffect(() => {
  (async () => {
    const { SudokuZkApp } = await import("sudoku");
  })();
}, []);

export default function Header({ children }: Props) {
  // const handleClick = () => {
  //   console.log('Click happened');
  // };
  return (
    <React.Fragment>
        <HeaderContainer className='px-12'>
            <HeaderWrapper>
              <HeaderLogoContainer>
                {/* put a degrade */}
                <HeaderLogo>💡</HeaderLogo>
                <span>SpeeDao</span>
              </HeaderLogoContainer>
              <ActionButton text={"Get Bot!"} size="small"/>
            </HeaderWrapper>
        </HeaderContainer>
    </React.Fragment>
  );
}