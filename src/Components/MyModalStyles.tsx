import styled, { keyframes } from 'styled-components';

interface TitleProps {
  reverse?: boolean;
  time: string;
}

const widthModfier = keyframes`
    0% { width: 0%; }
    50% { width: 50%; }
    100% { width: 100%; }
`;

export const ModalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 2000;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgb(238 238 238 / 50%);
`;

export const Modal = styled.div`
  width: 550px;
  height: 350px;
  background-color: rgba(27, 30, 41, 0.8);
  padding: 20px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const NoteText = styled.p`
  word-break: break-all;
  color: #a678d4;
`;

export const ButtonContainer = styled.div``;
