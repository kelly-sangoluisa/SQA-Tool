import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Roles('admin')
  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Roles('admin', 'evaluator')
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('admin')
  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.service.updateRole(id, dto.roleName);
  }
}
