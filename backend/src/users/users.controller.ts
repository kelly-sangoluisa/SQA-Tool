import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCookieAuth, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiCookieAuth('sb-access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Listar usuarios (solo admin)' })
  @ApiOkResponse({ description: 'Lista de usuarios', type: User, isArray: true })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos (se requiere rol admin)' })
  getAll() {
    return this.service.findAll();
  }

  @Roles('admin', 'evaluator')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID (admin o evaluator)' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del usuario' })
  @ApiOkResponse({ description: 'Usuario', type: User })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('admin')
  @Patch(':id/role')
  @ApiOperation({ summary: 'Actualizar rol de un usuario (solo admin)' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID del usuario' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'Usuario actualizado', type: User })
  @ApiBadRequestResponse({ description: 'Rol inválido o no encontrado' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos (se requiere rol admin)' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.service.updateRole(id, dto.roleName);
  }
}
