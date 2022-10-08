import React, { ReactNode } from 'react';
import { ActionButtonWrapper } from './styles';

type Sizes = "small" | "medium" | "big"

interface Props {
  children?: ReactNode;
  size?: Sizes;
  text: string;
  arrow?: boolean;
}

export default function ActionButton({ children, size, text, arrow }: Props) {
    const Arrow = arrow === true ? <span>&rarr;</span> : ""
  return (
    <React.Fragment>
        <a href="https://discord.com/api/oauth2/authorize?client_id=839732718699020298&permissions=1644637453392&scope=bot">
            <ActionButtonWrapper size={size}>
                <div>{text} {Arrow}</div>
            </ActionButtonWrapper>
        </a>
    </React.Fragment>
  );
}