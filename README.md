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

## Práctica 10: Respuestas a las preguntas

### Parte 1
1. **¿Por qué el filtro atrapa la clase base y no cada error por separado?**
   Porque al usar herencia en TypeScript, `ErrorDeDominio` es la clase padre. Al indicarle a `@Catch(ErrorDeDominio)` que atrape al padre, automáticamente atrapa a cualquier clase hija (como `CupoLlenoError`), evitando tener que registrar cada excepción individualmente.

2. **¿Por qué este middleware no podría decidir si un usuario tiene permiso para una ruta?**
   Porque el middleware es de Express y se ejecuta antes de que NestJS determine a qué método o controlador va dirigida la petición. No tiene acceso a los decoradores (como `@Roles`) ni al contexto de ejecución de NestJS.

3. **¿Por qué la petición que responde 409 no aparece en el registro del interceptor?**
   Porque el interceptor (`LoggingInterceptor`) usa `.pipe(tap(...))` en el flujo normal (exitoso) de la respuesta. Cuando el servicio lanza una excepción, el flujo normal se rompe y salta directamente al filtro de excepciones, ignorando el `tap` del interceptor.

4. **¿Por qué este cambio (sobre) rompe a cualquier cliente que ya estuviera usando la API?**
   Porque la estructura de la respuesta cambia. El cliente esperaba recibir la información directamente en la raíz de la respuesta, pero ahora todo viene envuelto dentro de la propiedad `data` de un objeto nuevo (`{ data: [...], meta: {...} }`).

5. **Si el servidor respondió en los dos casos de CORS, ¿quién bloquea y a quién protege?**
   El servidor procesa la petición y manda una respuesta, pero es el **navegador web del cliente** quien bloquea el acceso a la respuesta. Esto **protege al usuario** de que sitios web maliciosos en otros orígenes roben sus datos haciendo peticiones a otras APIs sin que el usuario se dé cuenta.

### Parte 2
1. **¿Por qué el campo se llama passwordHash y no password?**
   Para evitar enviar o guardar contraseñas en texto claro por accidente. Al llamarlo `passwordHash`, el desarrollador es consciente de que ahí solo debe ir texto cifrado (un hash), reduciendo el riesgo de filtraciones.

2. **Si el contenido del token se puede leer, ¿qué es lo que protege la firma?**
   Protege la **integridad y autenticidad**. Aunque cualquiera lea el payload, si alguien intenta modificar un dato (como cambiar su rol a `admin`), la firma se invalida automáticamente porque el atacante no tiene la llave secreta (`JWT_SECRET`) para volver a firmar el token.

3. **¿Por qué los dos errores del inicio de sesión dicen exactamente lo mismo?**
   Por seguridad contra enumeración. Si los mensajes fueran distintos (ej. 'El correo no existe' vs 'Contraseña incorrecta'), un atacante podría usar fuerza bruta para descubrir qué correos sí están registrados en el sistema probando aleatoriamente.

4. **¿Por qué es más seguro proteger todo y abrir a mano, que al revés?**
   Porque si olvidas abrir una ruta pública, el sistema falla de manera segura (lanza 401 y te das cuenta al probar). Si fuera público por omisión y olvidas proteger una ruta, dejas un hueco de seguridad gravísimo que probablemente pase desapercibido.

5. **¿Cuál es la diferencia entre un 401 y un 403?**
   - **401 Unauthorized:** No sabemos quién eres (no hay token o es inválido). Es un error de autenticación.
   - **403 Forbidden:** Sabemos quién eres (el token es válido), pero no tienes permiso o autorización para hacer la acción solicitada.

6. **¿Cuántas líneas del AuthService tuvieron que cambiar para pasar de memoria a MySQL? ¿Por qué?**
   **Cero líneas.** Gracias a la inyección de dependencias y al principio de inversión de dependencias, `AuthService` solo depende de la interfaz `UsuarioRepository`. El cambio se hizo únicamente en `auth.module.ts` inyectando la implementación de Prisma en lugar de la de memoria.

7. **¿Por qué es importante tomar al usuario de los claims del token y no de un parámetro de la URL o del cuerpo?**
   Porque el cliente controla la URL y el cuerpo de la petición y podría falsificarlos. En cambio, los claims del token están protegidos por la firma del servidor; no se pueden alterar sin invalidar el token. 
   **Ejemplo concreto:** Si la API confiara en el ID del cuerpo (`{ "miembroId": 3 }`), Karla (miembro 1) podría hacerse pasar por Sofía (miembro 3) y cancelar su inscripción. Al tomar a Karla directamente del token validado por el `@UsuarioActual()`, si intenta cancelar una inscripción que no es suya, el controlador se da cuenta y lo bloquea con un 403.

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
