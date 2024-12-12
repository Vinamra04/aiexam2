import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PersonaService } from './persona.service';
import {
  AssignPersonaRequestDto,
  FindPersonaRequestDto,
  NewPersonaRequestDto,
} from './dto/persona.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { isAdmin } from 'src/utils';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: NewPersonaRequestDto) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.personaService.create(body, req);
  }

  @Get('findall')
  @UseGuards(JwtAuthGuard)
  async findall(@Req() req: any) {
    return await this.personaService.findall(req);
  }
  @Post('find')
  @UseGuards(JwtAuthGuard)
  async find(@Req() req: any, @Body() body: FindPersonaRequestDto) {
    return await this.personaService.find(req, body);
  }
  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req: any, @Body() body: FindPersonaRequestDto) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.personaService.delete(req, body);
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard)
  async assign(@Req() req: any, @Body() body: AssignPersonaRequestDto) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.personaService.persona_access(req, body);
  }

  @Post('deassign')
  @UseGuards(JwtAuthGuard)
  async deassign(@Req() req: any, @Body() body: AssignPersonaRequestDto) {
    if (!isAdmin(req.user)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    return await this.personaService.persona_remove_access(req, body);
  }
}
