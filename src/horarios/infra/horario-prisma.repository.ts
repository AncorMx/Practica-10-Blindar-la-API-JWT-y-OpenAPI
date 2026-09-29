import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Horario } from '../dominio/entidades';
import { HorarioRepository } from '../dominio/horario.repository';
import { CrearHorarioDto } from '../dto/crear-horario.dto';
import { ActualizarHorarioDto } from '../dto/actualizar-horario.dto';

@Injectable()
export class HorarioPrismaRepository implements HorarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<Horario[]> {
    return this.prisma.horario.findMany();
  }

  async buscarPorId(id: number): Promise<Horario | null> {
    return this.prisma.horario.findUnique({ where: { id } });
  }

  async crear(datos: CrearHorarioDto): Promise<Horario> {
    return this.prisma.horario.create({
      data: {
        claseId: datos.claseId,
        dia: datos.dia,
        horaInicio: datos.horaInicio,
        cupoMaximo: datos.cupoMaximo,
        entrenador: datos.entrenador,
      },
    });
  }

  async actualizar(id: number, datos: ActualizarHorarioDto): Promise<Horario | null> {
    const existe = await this.buscarPorId(id);
    if (!existe) return null;
    return this.prisma.horario.update({
      where: { id },
      data: datos,
    });
  }

  async eliminar(id: number): Promise<Horario | null> {
    const existe = await this.buscarPorId(id);
    if (!existe) return null;
    return this.prisma.horario.delete({ where: { id } });
  }
}
