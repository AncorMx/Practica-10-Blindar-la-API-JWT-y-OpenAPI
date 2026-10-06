# Gimnasio API — Práctica 10: Blindar la API con JWT y OpenAPI

Proyecto de NestJS para la gestión de clases, horarios, miembros e inscripciones de un gimnasio. Incluye conexión a MySQL con Prisma ORM, validación con DTOs, filtro global de excepciones, CORS, documentación interactiva con Swagger (OpenAPI) y autenticación/autorización con JWT y Guards.

---

## Práctica 10: Respuestas a las preguntas

### Parte 1

1. **¿Por qué el filtro atrapa la clase base y no cada error por separado?**  
   Porque `ErrorDeDominio` es la clase padre y todos los errores de negocio heredan de ella. Al poner `@Catch(ErrorDeDominio)`, Nest atrapa cualquier error hijo (como `CupoLlenoError` o `DuplicadoError`) de un solo jalón sin tener que registrar cada uno a mano.

2. **¿Por qué este middleware no podría decidir si un usuario tiene permiso para una ruta?**  
   Porque los middlewares se ejecutan muy al principio del ciclo de vida (a nivel Express), antes de que NestJS sepa a qué controlador o método va la petición. Por eso no tienen acceso al contexto de Nest ni a los decoradores como `@Roles`.

3. **¿Por qué la petición que responde 409 no aparece en el registro del interceptor?**  
   Porque el interceptor usa `.pipe(tap(...))` sobre la respuesta exitosa. Cuando el servicio lanza una excepción, el flujo se corta de inmediato y salta directo al filtro de excepciones, así que nunca llega al `tap`.

4. **¿Por qué este cambio (sobre) rompe a cualquier cliente que ya estuviera usando la API?**  
   Porque le cambia la estructura a la respuesta. Si el frontend antes esperaba el arreglo directo, ahora le llega envuelto dentro de `{ data: [...], meta: {...} }`, así que si no actualiza su código para leer `res.data.data`, va a fallar.

5. **Si el servidor respondió en los dos casos de CORS, ¿quién bloquea y a quién protege?**  
   El que bloquea es el **navegador del cliente**, no el servidor. El backend procesa la petición y responde, pero el navegador no le entrega la respuesta a la página si el origen no está permitido. Esto protege al **usuario** para que otra página web no haga peticiones a la API usando su sesión.

### Parte 2

1. **¿Por qué el campo se llama passwordHash y no password?**  
   Para dejar bien claro que ahí se guarda el hash cifrado y nunca la contraseña en texto plano, evitando que alguien por error la guarde o la mande sin encriptar.

2. **Si el contenido del token se puede leer, ¿qué es lo que protege la firma?**  
   Protege la **integridad**. Cualquiera puede decodificar el payload en base64, pero si alguien intenta cambiar su rol a admin o modificar su ID, la firma ya no cuadra con el secreto del servidor (`JWT_SECRET`) y el token queda rechazado.

3. **¿Por qué los dos errores del inicio de sesión dicen exactamente lo mismo?**  
   Por seguridad. Si dijeras "el correo no existe" o "contraseña incorrecta", un atacante podría ir probando correos para ver cuáles sí están registrados en el sistema. Al dar el mismo mensaje, no le das pistas.

4. **¿Por qué es más seguro proteger todo y abrir a mano, que al revés?**  
   Porque si se te olvida poner pública una ruta, te das cuenta rápido porque te da 401 en las pruebas. Pero si dejas todo público por default y olvidas proteger una ruta privada, dejas un hueco de seguridad grave abierto sin enterarte.

5. **¿Cuál es la diferencia entre un 401 y un 403?**  
   - **401 Unauthorized:** Problema de autenticación. No sabemos quién eres (no mandaste token o no sirve).
   - **403 Forbidden:** Problema de autorización. Sí sabemos quién eres (el token es válido), pero no tienes permiso para hacer esa acción.

6. **¿Cuántas líneas del AuthService tuvieron que cambiar para pasar de memoria a MySQL? ¿Por qué?**  
   **Cero líneas.** Como el servicio usa la interfaz `UsuarioRepository` por inyección de dependencias, no le importa qué motor hay detrás. Solo se cambió el provider en `auth.module.ts` para que use `UsuarioPrismaRepository`.

7. **¿Por qué es importante tomar al usuario de los claims del token y no de un parámetro de la URL o del cuerpo?**  
   Porque el usuario puede modificar el body o la URL a su antojo, pero el token no porque viene firmado por el servidor.  
   **Ejemplo:** Si tomáramos el ID del body, Karla podría mandar `{ "miembroId": 2 }` para cancelar o inscribir a Omar. Al sacarlo del token con `@UsuarioActual()`, el sistema sabe que es Karla y si intenta registrar a otro miembro, le bota un 403.

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

## Evidencias
Todas las capturas de pantalla de las pruebas con Swagger y Postman, junto con la explicación de cada caso y el diagrama de secuencia JWT, están documentadas en [`evidencias/EVIDENCIAS.md`](evidencias/EVIDENCIAS.md).

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
