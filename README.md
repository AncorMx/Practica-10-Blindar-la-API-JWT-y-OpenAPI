# Gimnasio API — Práctica 9: Blindar la API

API REST en NestJS para el gimnasio: `Clases`, `Horarios`, `Miembros` e `Inscripciones`, blindada con validación mediante DTOs y `class-validator`, traducción centralizada de errores de dominio con Filtro de Excepciones, configuración de CORS y persistencia relacional con Prisma ORM y MySQL.

---

## Respuestas a las Preguntas — Práctica 9

### 1. ¿Qué línea del Service o del Controller tuvo que cambiar para que Clases hablara con MySQL?
**Ninguna línea.** Gracias a los principios de Inversión de Control (IoC) e Inyección de Dependencias (DI) de NestJS y al uso de la interfaz `ClaseRepository`, ni `ClasesService` ni `ClasesController` tuvieron que cambiar. Todo lo que se modificó fue la configuración de proveedores en `clases.module.ts`, reemplazando `ClaseMemoriaRepository` por `ClasePrismaRepository` en la propiedad `useClass`.

### 2. ¿Por qué InscripcionesService no tuvo que cambiar ni una línea de las reglas de cupo y duplicados?
Porque la lógica de negocio y las reglas del dominio (como verificar cupos disponibles o evitar inscripciones duplicadas) residen en `InscripcionesService`, el cual depende únicamente de la abstracción `InscripcionRepository`. Al implementar `InscripcionPrismaRepository` cumpliendo exactamente la misma interfaz, el servicio interactúa con los datos de MySQL ejecutando exactamente las mismas comprobaciones sin requerir modificaciones.

### 3. ¿Por qué una interfaz no puede validar nada en tiempo de ejecución?
Porque las interfaces de TypeScript se **eliminan por completo ("type erasure")** al transpilar el código a JavaScript. En tiempo de ejecución (runtime), una interfaz no existe como objeto ni posee metadatos. Las **clases**, en cambio, sí se conservan como funciones constructoras y prototipos en JavaScript, lo que permite a librerías como `class-validator` y `class-transformer` inspeccionar metadatos y aplicar reglas de validación sobre los objetos recibidos en las peticiones HTTP.

### 4. ¿Qué código de estado responde y qué trae en el cuerpo al enviar un cuerpo inválido?
Responde con un código de estado HTTP **`400 Bad Request`**. En el cuerpo de la respuesta devuelve un objeto JSON con la siguiente estructura:
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
Si se envía un campo no definido en el DTO (gracias a `forbidNonWhitelisted: true`), responde:
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
El controlador quedó **29 líneas más corto** (pasó de 82 a 53 líneas). Se eliminaron las verificaciones manuales de tipos (`Number.isInteger`) y los bloques `try...catch` de captura manual de excepciones, ya que la validación es gestionada globalmente por el `ValidationPipe` y la traducción de excepciones de dominio por el `DominioExcepcionFilter`.

### 6. Si la respuesta llega en los dos casos, ¿quién bloquea realmente y a quién protege?
Quien bloquea realmente es el **navegador web del cliente**, no el servidor. El servidor procesa la petición y responde adjuntando la cabecera `Access-Control-Allow-Origin` si el origen coincide con los configurados. Si no coincide, el navegador intercepta la respuesta e impide que el código JavaScript de la página la lea. CORS **protege al usuario** (al cliente), evitando que sitios web maliciosos lean información privada o realicen acciones en APIs autenticadas en nombre del usuario.

---

## Respuestas a las Preguntas — Práctica 8 (Contexto de Persistencia)

### 1. ¿Por qué el paquete del adaptador se llama `@prisma/adapter-mariadb` si usamos MySQL?
MariaDB y MySQL comparten el mismo protocolo de conexión de red. El adaptador utiliza un driver unificado compatible con ambos motores de base de datos.

### 2. ¿Editar `schema.prisma` cambió algo en la base de datos antes de migrar?
No. `schema.prisma` es únicamente una declaración del modelo. La base de datos solo se modifica al ejecutar las migraciones (`prisma migrate` / `prisma db push`).

### 3. ¿La carpeta de migraciones es una foto del esquema o un historial?
Es un historial cronológico de cambios de esquema.

### 4. ¿Por qué `Horario.clase` sí crea columna y `Clase.horarios` no?
Porque `Horario` contiene la llave foránea física (`claseId`) en MySQL. `Clase.horarios` es solo una relación lógica de Prisma.

### 5. ¿De dónde sale la relación de muchos a muchos entre Miembro y Horario?
Nace del modelo `Inscripcion`, que actúa como tabla pivote o intermedia conectando `miembroId` y `horarioId`.

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

3. Poblar la base de datos con los datos iniciales:
```bash
npx ts-node prisma/seed.ts
```

4. Iniciar la aplicación en modo desarrollo:
```bash
npm run start:dev
```
