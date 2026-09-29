import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActualizarHorarioDto {
  @IsOptional()
  @IsInt()
  claseId?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  dia?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  horaInicio?: string;

  @IsOptional()
  @IsInt()
  cupoMaximo?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  entrenador?: string;
}
