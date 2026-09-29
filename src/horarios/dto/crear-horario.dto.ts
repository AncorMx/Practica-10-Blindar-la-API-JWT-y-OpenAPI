import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CrearHorarioDto {
  @IsInt()
  claseId: number;

  @IsString()
  @IsNotEmpty()
  dia: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsInt()
  cupoMaximo: number;

  @IsString()
  @IsNotEmpty()
  entrenador: string;
}
