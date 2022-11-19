/* eslint-disable @next/next/no-img-element */
import React, { ReactNode } from 'react';
import {
  AccountInputContainer,
  OptionButton,
  OptionButtonContainer,
  StyleInput,
} from './styles';

interface Props {
  children?: ReactNode;
  account?: any;
  setAccount: any;
  text: string;
}

export default function AccountInput({
  children,
  account,
  setAccount,
  text,
}: Props) {
  return (
    <React.Fragment>
      <AccountInputContainer>
        <label htmlFor="">{text}</label>
        <StyleInput
          onChange={(e) => {
            setAccount(e.target.value);
          }}
        ></StyleInput>
      </AccountInputContainer>
    </React.Fragment>
  );
}
