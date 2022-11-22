import React, { ReactNode } from 'react';
import { ActionButtonWrapper } from './styles';

type Sizes = 'small' | 'medium' | 'big';

interface Props {
  children?: ReactNode;
  size?: Sizes;
  text: string;
  arrow?: boolean;
  action?: any;
  disabled?: boolean;
}

export default function ActionButton({
  children,
  size,
  text,
  arrow,
  action,
  disabled = false,
}: Props) {
  const Arrow = arrow === true ? <span>&rarr;</span> : '';
  return (
    <React.Fragment>
      <div className="self-center cursor-pointer">
        <ActionButtonWrapper
          disabled={disabled}
          onClick={!disabled ? action : () => {}}
          size={size}
        >
          <div>
            {text} {Arrow}
          </div>
        </ActionButtonWrapper>
      </div>
    </React.Fragment>
  );
}
