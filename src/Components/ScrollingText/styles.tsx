import styled, { keyframes } from "styled-components"

const TextMoving = keyframes`
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
`;

export const ScrollingContainer = styled.div`
    border-top: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
    overflow: hidden;
    margin-top: 10%;
    width: 100%;
`


export const ScrollText = styled.div`
    font-size: 68px;
    font-weight: 800;
    text-align: right;
    transform: translateX(-100%);
    animation: ${TextMoving} 10s linear infinite alternate;

    & span {
        margin-left: 15%;
    }
`