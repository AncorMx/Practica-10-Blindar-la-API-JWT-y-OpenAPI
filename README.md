# Gimnasio API — Práctica 9: Blindar la API

Proyecto de NestJS para la gestión de clases, horarios, miembros e inscripciones de un gimnasio, conectado a MySQL con Prisma ORM y blindado con validación de DTOs, filtro de excepciones centralizado y CORS.

---

## Respuestas a las Preguntas

### 1. ¿Qué línea del Service o del Controller tuvo que cambiar para que Clases hablara con MySQL?
Ninguna. Como se usó Inyección de Dependencias y la interfaz `ClaseRepository`, el servicio y el controlador solo conocen la interfaz. El único cambio fue en `clases.module.ts`, cambiando `ClaseMemoriaRepository` por `ClasePrismaRepository` en la propiedad `useClass`.

### 2. ¿Por qué InscripcionesService no tuvo que cambiar ni una línea de las reglas de cupo y duplicados?
Porque toda la lógica de validación de cupos y duplicados está escrita en el servicio usando los métodos de la interfaz `InscripcionRepository`. Como `InscripcionPrismaRepository` implementa los mismos métodos exactos consultando MySQL, el servicio sigue funcionando igual sin tocar su código.

### 3. ¿Por qué una interfaz no puede validar nada en tiempo de ejecución?
Porque las interfaces de TypeScript existen solo mientras programas y se borran por completo al compilar a JavaScript. Al momento de ejecutarse la aplicación ya no existen. Las clases sí se conservan en JavaScript, lo que permite a `class-validator` revisar sus propiedades y aplicar los decoradores en tiempo de ejecución.

### 4. ¿Qué código de estado responde y qué trae en el cuerpo al enviar datos inválidos?
Responde un código **400 Bad Request**. En el cuerpo devuelve un JSON con el estado, el mensaje de error de la validación y el tipo de error:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "horarioId must be an integer number",
    "miembroId must be an integer number"
  ]
}
```

Si se manda un campo extra que no está en el DTO (por la opción `forbidNonWhitelisted: true`), también responde 400 indicando que esa propiedad no debería existir:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    "property campoInvalido should not exist"
  ]
}
```

### 5. ¿Cuántas líneas quedó más corto el controlador (`InscripcionesController`)?
Quedó **29 líneas más corto** (pasó de 82 líneas a 53). Se pudieron quitar las validaciones manuales de números y todo el bloque `try/catch` que atrapaba los errores, ya que ahora el `ValidationPipe` valida los datos y el `DominioExcepcionFilter` maneja los errores de forma global.

### 6. Si la respuesta llega en los dos casos, ¿quién bloquea realmente y a quién protege?
El que bloquea realmente es el **navegador web del usuario**, no el servidor. El servidor procesa la petición y responde, pero si la cabecera `Access-Control-Allow-Origin` no coincide con el dominio donde está corriendo la web, el navegador bloquea el acceso a la respuesta por seguridad. CORS protege al **usuario cliente** para evitar que sitios web maliciosos lean datos de APIs usando la sesión activa del usuario.

---

## Práctica 8 (Preguntas anteriores)

1. **¿Por qué el paquete se llama `@prisma/adapter-mariadb` si usamos MySQL?**  
   Porque MariaDB y MySQL usan el mismo protocolo de red y comunicación, así que el adaptador sirve para los dos motores.

2. **¿Editar `schema.prisma` cambió la base de datos antes de migrar?**  
   No. Solo cambia el archivo de código. La base de datos no cambia hasta que corres la migración (`prisma migrate` o `prisma db push`).

3. **¿La carpeta de migraciones es una foto o un historial?**  
   Es un historial con los cambios de la base de datos a lo largo del tiempo.

4. **¿Por qué `Horario.clase` no crea columna en la base de datos y `Horario.claseId` sí?**  
   Porque `claseId` es la columna física (llave foránea) en la tabla MySQL, mientras que `Horario.clase` es solo una relación virtual de Prisma para hacer consultas.

5. **¿De dónde sale la relación muchos a muchos entre Miembro y Horario?**  
   De la tabla `Inscripcion`, que funciona como tabla intermedia relacionando el id de miembro con el id de horario.

---

## Instrucciones para ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar la base de datos en `.env`:
   ```env
   DATABASE_URL="mysql://root:5826@localhost:3306/gimnasio"
   ```

3. Poblar la base de datos:
   ```bash
   npx ts-node prisma/seed.ts
   ```

4. Iniciar la API:
   ```bash
   npm run start:dev
   ```
