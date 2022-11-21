/* eslint-disable @next/next/no-img-element */
import ActionButton from '../ActionButton';
import React, { ReactNode, useState, useEffect } from 'react';
import AccountInput from './AccountInput';
import AmountOptions from './AmountOptions';
import {
  CardButton,
  CardButtonsContainer,
  CardContainer,
  CardFieldsContainer,
} from './styles';
import MyModal from '../../Components/MyModal';

interface Props {
  children?: ReactNode;
  note: string;
  withdraw: (note) => any;
  depositFunds: (amount: number) => void;
}

type classState = '' | 'active';

export default function TransactionCard({
  children,
  note,
  withdraw,
  depositFunds,
}: Props) {
  // const handleClick = () => {
  //   console.log('Click happened');
  // };
  const [showModal, setShowModal] = useState(true);
  const [btn1Class, setBtn1Class] = useState<classState>('active');
  const [btn2Class, setBtn2Class] = useState<classState>('');
  const [amountOption, setAmountOption] = useState<number>(1);
  const [accountRecipient, setAccountRecipient] = useState();
  /*  const [noteValue, setNoteValue] = useState(
    'AHIASIN89791823$@!@jhajskasjonnasI)QSN'
  ); */
  const [transferNote, setTransferNote] = useState();
  function updateButtonStyle() {
    if (btn1Class) {
      setBtn1Class('');
      setBtn2Class('active');
    } else {
      setBtn1Class('active');
      setBtn2Class('');
    }
  }
  return (
    <React.Fragment>
      <CardContainer>
        <CardButtonsContainer>
          <CardButton className={btn1Class} onClick={updateButtonStyle}>
            Deposit
          </CardButton>
          <CardButton className={btn2Class} onClick={updateButtonStyle}>
            Withdraw
          </CardButton>
        </CardButtonsContainer>
        {btn1Class && (
          <CardFieldsContainer>
            <AmountOptions
              option={amountOption}
              setOption={setAmountOption}
            ></AmountOptions>
            {/* <AccountInput
              text="Recipient address"
              setAccount={setAccountRecipient}
            /> */}
            <ActionButton
              action={() => {
                depositFunds(amountOption);
                setShowModal(true);
              }}
              size="small"
              text="Transfer"
            ></ActionButton>
          </CardFieldsContainer>
        )}
        {btn2Class && (
          <CardFieldsContainer>
            {/* <AmountOptions option={amountOption} setOption={setAmountOption}></AmountOptions> */}
            <AccountInput text="Transfer note" setAccount={setTransferNote} />
            <AccountInput
              text="Recipient address"
              setAccount={setAccountRecipient}
            />
            <ActionButton
              action={() => {
                withdraw(transferNote);
              }}
              size="small"
              text="Withdraw"
            ></ActionButton>
          </CardFieldsContainer>
        )}
      </CardContainer>
      <MyModal
        isOpen={showModal}
        setIsOpen={setShowModal}
        noteValue={note}
      ></MyModal>
    </React.Fragment>
  );
}
