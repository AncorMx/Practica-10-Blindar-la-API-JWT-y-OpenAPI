import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
import 'dotenv/config';

const dbUrl = (process.env.DATABASE_URL || '').replace('mysql:', 'mariadb:');
const pool = mariadb.createPool(dbUrl);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.inscripcion.deleteMany();
  await prisma.horario.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.miembro.deleteMany();

  console.log('Poblando base de datos...');

  const clase1 = await prisma.clase.create({
    data: { id: 1, nombre: 'Yoga', duracionMin: 60, descripcion: 'Clase de Yoga relajante' },
  });
  const clase2 = await prisma.clase.create({
    data: { id: 2, nombre: 'Spinning', duracionMin: 45, descripcion: 'Cardio de alta intensidad' },
  });

  await prisma.horario.createMany({
    data: [
      { id: 1, claseId: clase1.id, dia: 'lunes', horaInicio: '07:00', cupoMaximo: 2, entrenador: 'Ana Robles' },
      { id: 2, claseId: clase1.id, dia: 'miercoles', horaInicio: '07:00', cupoMaximo: 3, entrenador: 'Ana Robles' },
      { id: 3, claseId: clase2.id, dia: 'martes', horaInicio: '19:00', cupoMaximo: 4, entrenador: 'Luis Fierro' },
    ],
  });

  await prisma.miembro.createMany({
    data: [
      { id: 1, nombre: 'Karla Duarte', correo: 'karla@itson.mx', membresia: 'premium', activo: true },
      { id: 2, nombre: 'Omar Valdez', correo: 'omar@itson.mx', membresia: 'plus', activo: true },
      { id: 3, nombre: 'Sofia Ibarra', correo: 'sofia@itson.mx', membresia: 'basica', activo: true },
    ],
  });

  console.log('¡Base de datos poblada exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
