import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

 @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        message: 'Usuario registrado exitosamente',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@example.com',
          fullName: 'Juan Pérez',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos o faltantes',
  })
  @ApiConflictResponse({
    description: 'El correo electrónico ya está registrado',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña' })
  @ApiOkResponse({
    description: 'Autenticación exitosa',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'usuario@example.com',
          fullName: 'Juan Pérez',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Formato de datos de entrada inválido',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar los tokens usando el Refresh Token' })
  @ApiOkResponse({
    description: 'Tokens renovados exitosamente',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'El Refresh Token no fue enviado o los datos son inválidos',
  })
  @ApiForbiddenResponse({
    description: 'Refresh Token inválido o expirado, o acceso denegado',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiOkResponse({
    description: 'Perfil del usuario autenticado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso inválido o no proporcionado',
  })
  getProfile(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
