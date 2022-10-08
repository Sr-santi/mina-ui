import styled from "styled-components"

export const HeaderContainer = styled.header`
    height: 129px;
    display: flex;
    position: fixed;
    padding-top: 24px;
    width: 100%;
    background: linear-gradient(180deg,#1b1e29 29.17%,rgba(27,30,41,0));
    z-index: 100;
    align-items: center;
    top: 0;
`

export const HeaderWrapper = styled.div`
    width: 100%;
    display: flex;
    color: #fff;
    justify-content: space-between;
`

export const HeaderLogoContainer = styled.div`
    display: flex;
    align-items: center;
    color: #fff;
    font-weight: 800;
    font-family: 'Montserrat';
    font-size: 30px;
    column-gap: 5px;
`

export const HeaderLogo = styled.div`
    display: flex;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 5px;
    background: linear-gradient(50deg,#cd4367,#e90e50);
`