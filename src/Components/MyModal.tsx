import React from 'react';
import { Fragment, useEffect, useState } from 'react';
import { StyleInput } from './TransactionCard/styles';
import '../styles/output.css';
import {
  ButtonContainer,
  Modal,
  ModalContainer,
  NoteText,
} from './MyModalStyles';
import ActionButton from './ActionButton';

export default function MyModal({
  isOpen,
  setIsOpen,
  noteValue,
}: {
  isOpen: any;
  setIsOpen: any;
  noteValue: string;
}) {
  function closeModal() {
    setIsOpen(false);
  }

  function copyToClipBoard() {
    navigator.clipboard.writeText(noteValue);
    closeModal();
  }

  useEffect(() => {
    copyToClipBoard();
  }, []);
  return (
    <>
      {isOpen && (
        <ModalContainer>
          <Modal>
            <div className="text-2xl font-bold leading-6 text-[#484848]">
              <h1>This is your transaction note:</h1>
            </div>
            <div className="mt-2">
              <p className="text-sm text-[#484848]">
                You can copy this note to withdraw your funds from the mixer:
              </p>
            </div>
            <NoteText>{noteValue ? noteValue : 'Loading...'}</NoteText>
            <ButtonContainer>
              <ActionButton
                size="small"
                text={'Copy and Close'}
                action={copyToClipBoard}
              />
            </ButtonContainer>
          </Modal>
        </ModalContainer>
      )}
    </>
  );
}
