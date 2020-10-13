import React, { FC } from 'react';
import styled from 'styled-components';

const Content: FC = (props) => {
  return <StyledDiv>{props.children}</StyledDiv>;
};

const StyledDiv = styled.div`
  background: pink;
  height: 100vh;
  padding: 70px 10px 10px 10px;
`;

export default Content;
