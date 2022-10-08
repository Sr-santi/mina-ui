import React, { ReactNode } from 'react';
import { CarouselContainer, CarouselItem } from './styles';

type Sizes = "small" | "medium" | "big"

interface Props {
  children?: ReactNode;
}
// pending component
export default function Carousel({ children }: Props) {
  return (
    <React.Fragment>
        <CarouselContainer>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
            <CarouselItem></CarouselItem>
        </CarouselContainer>
    </React.Fragment>
  );
}