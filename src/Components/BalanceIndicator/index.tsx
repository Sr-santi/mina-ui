import React, { ReactNode } from 'react';
import {
  AccountContainer,
  AccountName,
  BalanceContainerWrapper,
} from './styles';

interface Props {
  children?: ReactNode;
}
// pending component
export default function BalanceContainer({ children }: Props) {
  return (
    <BalanceContainerWrapper>
      <AccountContainer>
        <AccountName>Account name :</AccountName>
        <div>1029 MINA</div>
      </AccountContainer>
      <AccountContainer>
        <AccountName>Account name 2 :</AccountName>
        <div>2423 MINA</div>
      </AccountContainer>
      <AccountContainer>
        <AccountName>Account name 3 :</AccountName>
        <div>902 MINA</div>
      </AccountContainer>
    </BalanceContainerWrapper>
  );
}
