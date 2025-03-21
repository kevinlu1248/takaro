import { styled } from '../../../styled';

export const Wrapper = styled.div`
  height: 100%;

  font-weight: 500;

  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  position: relative;

  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

export const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  height: 50px;
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${({ theme }) => theme.spacing[1]};
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
`;

export const MessageContainer = styled.div`
  min-height: 550px;
  height: calc(100% - 50px);
`;
