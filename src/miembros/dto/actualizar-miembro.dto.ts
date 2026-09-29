import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActualizarMiembroDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsIn(['basica', 'plus', 'premium'], {
    message: 'La membresia debe ser basica, plus o premium',
  })
  membresia?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
