import React, { ReactNode } from 'react';
import { ScrollingContainer, ScrollText } from './styles';

type Sizes = "small" | "medium" | "big"

interface Props {
  children?: ReactNode;
  title: string
}

export default function ScrollingText({ children, title }: Props) {
  return (
    <React.Fragment>
        <ScrollingContainer>
            <ScrollText>
                <span className='text-[#7dec2f]'>{title}</span>
                <span className='text-[#cd4367]'>{title}</span>
                <span className='text-white'>{title}</span>
                <span className='text-[#7dec2f]'>{title}</span>
                <span className='text-[#cd4367]'>{title}</span>
                <span className='text-white'>{title}</span>
            </ScrollText>
        </ScrollingContainer>
    </React.Fragment>
  );
}