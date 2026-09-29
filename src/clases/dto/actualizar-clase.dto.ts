import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActualizarClaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsInt()
  duracionMin?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
