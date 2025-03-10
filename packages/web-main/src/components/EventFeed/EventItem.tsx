import { FC } from 'react';
import { styled } from '@takaro/lib-components';
import { EventDetail } from './EventDetail';
import { DateTime } from 'luxon';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: top;
`;

const EventType = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['0_5']};

  p:first-child {
    font-weight: bold;
  }

  p:last-child {
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const ListItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['7']};
  margin-left: ${({ theme }) => theme.spacing['2']};
`;

const Data = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 0.5fr 2fr;
`;

const DataItem = styled.div`
  p:first-child {
    text-transform: capitalize;
    color: ${({ theme }) => theme.colors.textAlt};
  }
`;

const Circle = styled.div`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  margin-top: 5px;
  left: -6px;

  position: absolute;
  border: 1px solid #474747;

  background-color: ${({ theme }) => theme.colors.textAlt};
`;
const EventProperty: FC<{ name: string; value: unknown }> = ({ name, value }) => {
  const val = (value as string) === '' ? '-' : value;
  return (
    <DataItem>
      <p>{name}</p>
      <p>{val as string}</p>
    </DataItem>
  );
};

export type EventItemProps = {
  eventType: string;
  createdAt: string;
  playerName?: string;
  gamserverName?: string;
  moduleName?: string;
  commandName?: string;
  data: Record<string, any>;
  onDetailClick: () => void;
};

export const EventItem: FC<EventItemProps> = ({
  eventType,
  createdAt,
  data,
  playerName,
  gamserverName,
  moduleName,
  commandName,
}) => {
  const timestamp = Date.parse(createdAt);
  const timeAgo = DateTime.fromMillis(timestamp).toRelative();

  let properties = <></>;

  switch (eventType) {
    case 'chat-message':
      properties = (
        <>
          <EventProperty name="gameserver" value={gamserverName} />
          <EventProperty name="player" value={playerName} />
          <EventProperty name="message" value={data.message} />
        </>
      );
      break;
    case 'command-executed':
      properties = (
        <>
          <EventProperty name="module" value={moduleName} />
          <EventProperty name="command" value={commandName} />
          <EventProperty name="arguments" value={JSON.stringify(data.command.arguments)} />
        </>
      );
      break;
    case 'hook-executed':
    case 'cronjob-executed':
      properties = (
        <>
          <EventProperty name="module" value={moduleName} />
          <EventProperty name="success" value={`${data?.result?.success}`} />
        </>
      );
      break;
    case 'player-connected':
    case 'player-disconnected':
      properties = (
        <>
          <EventProperty name="gameserver" value={gamserverName} />
          <EventProperty name="player" value={playerName} />
        </>
      );
  }

  return (
    <ListItem>
      <Circle />
      <Header>
        <EventType>
          <p>{eventType}</p>
          <p>{timeAgo}</p>
        </EventType>
        <EventDetail eventType={eventType} metaData={data} />
      </Header>
      <Data>{properties}</Data>
    </ListItem>
  );
};
