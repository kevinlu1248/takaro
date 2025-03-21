import { ITakaroQuery } from '@takaro/db';
import { TakaroDTO, TakaroModelDTO, errors, traceableClass } from '@takaro/util';
import { PERMISSIONS } from '@takaro/auth';
import { Type } from 'class-transformer';
import {
  Length,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsString,
  ValidateNested,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { PaginatedOutput } from '../db/base.js';
import { RoleModel, RoleRepo } from '../db/role.js';
import { TakaroService } from './Base.js';
import { UserService } from './UserService.js';
import { PlayerService } from './PlayerService.js';
import { EventCreateDTO, EventService } from './EventService.js';

@ValidatorConstraint()
export class IsPermissionArray implements ValidatorConstraintInterface {
  public async validate(permissions: PERMISSIONS[]) {
    return (
      Array.isArray(permissions) && permissions.every((permission) => Object.values(PERMISSIONS).includes(permission))
    );
  }
}

export class RoleCreateInputDTO extends TakaroDTO<RoleCreateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsString({ each: true })
  permissions: string[];
}

export class RoleUpdateInputDTO extends TakaroDTO<RoleUpdateInputDTO> {
  @Length(3, 20)
  name: string;

  @IsString({ each: true })
  permissions: string[];
}

export class SearchRoleInputDTO {
  @Length(3, 20)
  name: string;
}

export class PermissionOutputDTO extends TakaroModelDTO<PermissionOutputDTO> {
  @IsString()
  permission!: string;

  @IsString()
  @IsOptional()
  friendlyName: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class PermissionCreateDTO extends TakaroDTO<PermissionOutputDTO> {
  @IsString()
  permission!: string;

  @IsString()
  @IsOptional()
  friendlyName: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class RoleOutputDTO extends TakaroModelDTO<RoleOutputDTO> {
  @IsString()
  name: string;

  @Type(() => PermissionOutputDTO)
  @ValidateNested({ each: true })
  permissions: PermissionOutputDTO[];
}

export class RoleAssignmentOutputDTO extends TakaroModelDTO<RoleAssignmentOutputDTO> {
  @IsUUID()
  playerId: string;

  @IsUUID()
  roleId: string;

  @IsUUID()
  @IsOptional()
  gameServerId: string;

  @Type(() => RoleOutputDTO)
  @ValidateNested()
  role: RoleOutputDTO;
}

@traceableClass('service:role')
export class RoleService extends TakaroService<RoleModel, RoleOutputDTO, RoleCreateInputDTO, RoleUpdateInputDTO> {
  get repo() {
    return new RoleRepo(this.domainId);
  }

  async find(filters: ITakaroQuery<RoleOutputDTO>): Promise<PaginatedOutput<RoleOutputDTO>> {
    return this.repo.find(filters);
  }

  async findOne(id: string): Promise<RoleOutputDTO | undefined> {
    return this.repo.findOne(id);
  }

  async create(item: RoleCreateInputDTO): Promise<RoleOutputDTO> {
    return this.createWithPermissions(item, item.permissions);
  }

  async update(id: string, item: RoleUpdateInputDTO): Promise<RoleOutputDTO> {
    const toUpdate = await this.repo.findOne(id);

    if (toUpdate?.name === 'root') {
      throw new errors.BadRequestError('Cannot update root role');
    }

    return this.repo.update(id, item);
  }

  async delete(id: string) {
    const toDelete = await this.repo.findOne(id);

    if (toDelete?.name === 'root') {
      throw new errors.BadRequestError('Cannot delete root role');
    }

    await this.repo.delete(id);
    return id;
  }

  async createWithPermissions(role: RoleCreateInputDTO, permissions: string[]): Promise<RoleOutputDTO> {
    const createdRole = await this.repo.create(role);
    await Promise.all(
      permissions.map((permission) => {
        return this.repo.addPermissionToRole(createdRole.id, permission);
      })
    );

    return this.repo.findOne(createdRole.id);
  }

  async setPermissions(roleId: string, permissions: string[]) {
    const role = await this.repo.findOne(roleId);

    const toRemove = role.permissions.filter((permission) => !permissions.includes(permission.permission));
    const toAdd = permissions.filter(
      (permission) => !role.permissions.map((cap) => cap.permission).includes(permission)
    );

    const removePromises = toRemove.map((permission) => {
      return this.repo.removePermissionFromRole(roleId, permission.permission);
    });
    const addPromises = toAdd.map((permission) => {
      return this.repo.addPermissionToRole(roleId, permission);
    });

    await Promise.all([...removePromises, ...addPromises]);

    return this.repo.findOne(roleId);
  }

  async assignRole(roleId: string, targetId: string, gameserverId?: string) {
    const userService = new UserService(this.domainId);
    const playerService = new PlayerService(this.domainId);
    const eventService = new EventService(this.domainId);

    const userRes = await userService.find({ filters: { id: [targetId] } });
    const playerRes = await playerService.find({ filters: { id: [targetId] } });

    if (userRes.total) {
      this.log.info('Assigning role to user');
      await this.repo.assignRoleToUser(targetId, roleId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleAssigned',
          userId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
    if (playerRes.total) {
      this.log.info('Assigning role to player');
      await this.repo.assignRoleToPlayer(targetId, roleId, gameserverId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleAssigned',
          gameserverId,
          playerId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
  }

  async removeRole(roleId: string, targetId: string, gameserverId?: string) {
    const userService = new UserService(this.domainId);
    const playerService = new PlayerService(this.domainId);
    const eventService = new EventService(this.domainId);

    const userRes = await userService.find({ filters: { id: [targetId] } });
    const playerRes = await playerService.find({ filters: { id: [targetId] } });

    if (userRes.total) {
      this.log.info('Removing role from user');
      await this.repo.removeRoleFromUser(targetId, roleId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleRemoved',
          userId: targetId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
    if (playerRes.total) {
      this.log.info('Removing role from player');
      await this.repo.removeRoleFromPlayer(targetId, roleId, gameserverId);
      await eventService.create(
        await new EventCreateDTO().construct({
          eventName: 'roleRemoved',
          playerId: targetId,
          gameserverId,
          meta: {
            roleId: roleId,
          },
        })
      );
    }
  }
}
