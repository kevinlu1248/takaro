import { FC, Fragment, useState } from 'react';
import { styled, Table, Loading, useTableActions, IconButton, Dropdown, Dialog, Button } from '@takaro/lib-components';
import { VariableOutputDTO, VariableSearchInputDTOSortDirectionEnum } from '@takaro/apiclient';
import { createColumnHelper } from '@tanstack/react-table';
import { useVariableDelete, useVariables } from 'queries/variables';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEdit as EditIcon, AiOutlineDelete as DeleteIcon, AiOutlineRight as ActionIcon } from 'react-icons/ai';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const TableContainer = styled.div`
  width: 100%;
  margin-top: 2rem;
`;

const Variables: FC = () => {
  useDocumentTitle('Variables');
  const { pagination, columnFilters, sorting, columnSearch } = useTableActions<VariableOutputDTO>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [activeVar, setActiveVar] = useState<VariableOutputDTO | null>(null);

  const { data, isLoading } = useVariables({
    page: pagination.paginationState.pageIndex,
    limit: pagination.paginationState.pageSize,
    sortBy: sorting.sortingState[0]?.id,
    extend: ['module', 'player', 'gameServer'],
    sortDirection: sorting.sortingState[0]?.desc
      ? VariableSearchInputDTOSortDirectionEnum.Desc
      : VariableSearchInputDTOSortDirectionEnum.Asc,
    filters: {
      key: columnFilters.columnFiltersState.find((filter) => filter.id === 'key')?.value,
      gameServerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'gameServerId')?.value,
      playerId: columnFilters.columnFiltersState.find((filter) => filter.id === 'playerId')?.value,
      moduleId: columnFilters.columnFiltersState.find((filter) => filter.id === 'moduleId')?.value,
    },
    search: {
      key: columnSearch.columnSearchState.find((search) => search.id === 'key')?.value,
      gameServerId: columnSearch.columnSearchState.find((search) => search.id === 'gameServerId')?.value,
      playerId: columnSearch.columnSearchState.find((search) => search.id === 'playerId')?.value,
      moduleId: columnSearch.columnSearchState.find((search) => search.id === 'moduleId')?.value,
    },
  });

  const columnHelper = createColumnHelper<VariableOutputDTO>();
  const columnDefs = [
    columnHelper.accessor('key', {
      header: 'Key',
      id: 'key',
      cell: (info) => info.getValue(),
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('value', {
      header: 'Value',
      id: 'value',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('gameServerId', {
      header: 'Game Server',
      id: 'gameServerId',
      cell: (info) => info.row.original.gameServer?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('playerId', {
      header: 'Player',
      id: 'playerId',
      cell: (info) => info.row.original.player?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('moduleId', {
      header: 'Module',
      id: 'moduleId',
      cell: (info) => info.row.original.module?.name,
      enableColumnFilter: true,
      enableSorting: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created at',
      id: 'createdAt',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Updated at',
      id: 'updatedAt',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.display({
      header: 'Actions',
      id: 'actions',
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      enablePinning: false,
      enableGlobalFilter: false,
      enableResizing: false,
      maxSize: 50,
      cell: (info) => (
        <Dropdown>
          <Dropdown.Trigger asChild>
            <IconButton icon={<ActionIcon />} ariaLabel="variable-actions" />
          </Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Menu.Item label="Edit variable" icon={<EditIcon />} onClick={() => navigate('')} />
            <Dropdown.Menu.Item
              label="Delete variable"
              icon={<DeleteIcon />}
              onClick={() => {
                setActiveVar(info.row.original);
                setOpenDialog(true);
              }}
            />
          </Dropdown.Menu>
        </Dropdown>
      ),
    }),
  ];

  if (isLoading || data === undefined) {
    return <Loading />;
  }

  return (
    <Fragment>
      <p>
        Variables allow you to store data in a key-value format, which is persisted between module runs. For example,
        variables are the way that the teleports module stores the teleport locations.
      </p>

      <TableContainer>
        <Table
          id="variables"
          columns={columnDefs}
          data={data.data}
          pagination={{
            ...pagination,
            pageOptions: pagination.getPageOptions(data),
          }}
          columnFiltering={columnFilters}
          columnSearch={columnSearch}
          sorting={sorting}
        />
      </TableContainer>

      <VariableDelete variable={activeVar} openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </Fragment>
  );
};

interface IVariableDeleteProps {
  variable: VariableOutputDTO | null;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

const VariableDelete: FC<IVariableDeleteProps> = ({ variable, openDialog, setOpenDialog }) => {
  const { mutateAsync, isLoading: isDeleting } = useVariableDelete();

  const handleOnDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (variable) {
      await mutateAsync(variable.id);
      setOpenDialog(false);
    }
  };

  if (!variable) return null;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Content>
        <Dialog.Heading>
          <span>Delete variable</span>
        </Dialog.Heading>
        <Dialog.Body>
          <h2>Delete variable</h2>
          <ul>
            {variable.module && <li>Module: {variable.module.name}</li>}
            {variable.gameServer && <li>Game Server: {variable.gameServer.name}</li>}
            {variable.player && <li>Player Name: {variable.player.name}</li>}
          </ul>
          <p>
            Are you sure you want to delete the variable <strong>{variable.key}</strong>?
          </p>
          <Button
            isLoading={isDeleting}
            onClick={(e) => handleOnDelete(e)}
            fullWidth
            text={'Delete variable'}
            color="error"
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
};

export default Variables;
