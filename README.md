# Gimnasio API — Práctica 8 (Prisma y MySQL)

API REST en NestJS para el gimnasio: `Clases`, `Horarios`, `Miembros` e `Inscripciones`, mapeadas con Prisma ORM a MySQL.

## Respuestas a las Preguntas

### 1. ¿Por qué el paquete del adaptador se llama `@prisma/adapter-mariadb` si usamos MySQL?
MariaDB y MySQL comparten el mismo protocolo de conexión a nivel de red. El driver de MariaDB funciona perfectamente para ambos motores, por lo que Prisma utiliza un solo adaptador unificado para gestionar las conexiones a MySQL y MariaDB.

### 2. ¿Editar `schema.prisma` cambió algo en la base de datos antes de migrar?
No. El archivo `schema.prisma` es únicamente la declaración de modelos en TypeScript/Prisma. La base de datos MySQL no sufre ningún cambio hasta que se ejecutan los comandos de migración (`prisma migrate`), los cuales generan y aplican el código SQL correspondiente.

### 3. ¿La carpeta de migraciones es una foto del esquema o un historial?
Es un historial de cambios. Cada subcarpeta generada representa una versión en el tiempo con su respectivo archivo `.sql`. Esto permite rastrear cómo ha evolucionado la estructura de la base de datos desde la migración inicial hasta la última modificación.

### 4. ¿Por qué `Horario.clase` sí crea columna y `Clase.horarios` no?
Porque `Horario` contiene la llave foránea (`claseId`) en la tabla física de MySQL. El campo `Clase.horarios` es solo una relación lógica a nivel de Prisma para consultar los registros relacionados, pero no representa una columna física en la tabla `clases`.

### 5. ¿De dónde sale la relación de muchos a muchos entre Miembro y Horario, si nunca se declaró como tal?
Nace del modelo explícito `Inscripcion`, el cual funciona como tabla pivote (o de unión) conectando `miembroId` y `horarioId`. Al vincular ambas entidades mediante esta tabla intermedia, se forma automáticamente una relación de muchos a muchos en el modelo relacional.

---

## Cómo ejecutar el proyecto

1. Instalar dependencias:
```bash
npm install
```

2. Configurar la base de datos en `.env`:
```env
DATABASE_URL="mysql://root:5826@localhost:3306/gimnasio"
```

3. Iniciar la aplicación:
```bash
npm run start:dev
```
