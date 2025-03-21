import { TakaroService } from './Base.js';
import { ITakaroQuery } from '@takaro/db';
import { send } from '@takaro/email';

import { UserModel, UserRepo } from '../db/user.js';
import { IsEmail, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { TakaroDTO, TakaroModelDTO, traceableClass } from '@takaro/util';
import { RoleOutputDTO } from './RoleService.js';
import { Type } from 'class-transformer';
import { ory } from '@takaro/auth';

export class UserOutputDTO extends TakaroModelDTO<UserOutputDTO> {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  idpId: string;

  @IsString()
  @IsOptional()
  discordId?: string;
}

export class UserOutputWithRolesDTO extends UserOutputDTO {
  @Type(() => RoleOutputDTO)
  @ValidateNested({ each: true })
  roles: RoleOutputDTO[];
}
export class UserCreateInputDTO extends TakaroDTO<UserCreateInputDTO> {
  @Length(3, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password?: string;

  @IsString()
  @IsOptional()
  idpId?: string;
}

export class UserUpdateDTO extends TakaroDTO<UserUpdateDTO> {
  @IsString()
  @Length(3, 50)
  @IsOptional()
  name?: string;
}

export class UserUpdateAuthDTO extends TakaroDTO<UserUpdateAuthDTO> {
  @IsString()
  @IsOptional()
  @Length(18, 18)
  discordId?: string;
}

@traceableClass('service:user')
export class UserService extends TakaroService<UserModel, UserOutputDTO, UserCreateInputDTO, UserUpdateDTO> {
  constructor(domainId: string) {
    super(domainId);
  }

  get repo() {
    return new UserRepo(this.domainId);
  }

  private async extendWithOry(user: UserOutputWithRolesDTO): Promise<UserOutputWithRolesDTO> {
    const oryIdentity = await ory.getIdentity(user.idpId);
    return new UserOutputWithRolesDTO().construct({
      ...user,
      email: oryIdentity.email,
    });
  }

  async find(filters: ITakaroQuery<UserOutputDTO>) {
    const result = await this.repo.find(filters);
    const extendedWithOry = {
      ...result,
      results: await Promise.all(result.results.map(this.extendWithOry.bind(this))),
    };

    return extendedWithOry;
  }

  async findOne(id: string) {
    const user = await this.repo.findOne(id);
    return this.extendWithOry.bind(this)(user);
  }

  async create(user: UserCreateInputDTO): Promise<UserOutputDTO> {
    const idpUser = await ory.createIdentity(user.email, this.domainId, user.password);
    user.idpId = idpUser.id;
    const createdUser = await this.repo.create(user);
    return this.extendWithOry.bind(this)(createdUser);
  }

  async update(id: string, data: UserUpdateAuthDTO | UserUpdateDTO): Promise<UserOutputDTO> {
    await this.repo.update(id, data);
    return this.extendWithOry.bind(this)(await this.repo.findOne(id));
  }

  async delete(id: string) {
    await this.repo.delete(id);
    await ory.deleteIdentity(id);
    return id;
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    return this.repo.assignRole(userId, roleId);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    return this.repo.removeRole(userId, roleId);
  }

  async inviteUser(email: string): Promise<void> {
    const user = await this.create(await new UserCreateInputDTO().construct({ email, name: email }));
    const recoveryFlow = await ory.getRecoveryFlow(user.idpId);

    await send({
      address: email,
      template: 'invite',
      data: {
        inviteLink: recoveryFlow.recovery_link,
      },
    });
  }
}
