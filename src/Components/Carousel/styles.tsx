import styled from "styled-components"

export const CarouselContainer = styled.div`
    width: 100%;
    display: flex;
    overflow-x: scroll;
    padding: 0 64px;
    box-sizing: border-box;
`

export const CarouselItem = styled.div`
    height: 131px;
    width: 212px;
    background: #1e212d;
    border: 4px solid #1e212d;
    border-radius: 16px;
    display: inline-block;
    margin: 0 4px;
    overflow: hidden;
    position: relative;
    z-index: 0;
`