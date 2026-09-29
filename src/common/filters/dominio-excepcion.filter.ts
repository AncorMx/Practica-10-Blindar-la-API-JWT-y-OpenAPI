import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ErrorDeDominio,
  HorarioNoEncontradoError,
  MiembroNoEncontradoError,
  CupoLlenoError,
  InscripcionDuplicadaError,
} from '../../inscripciones/dominio/errores';

@Catch(ErrorDeDominio)
export class DominioExcepcionFilter implements ExceptionFilter {
  catch(exception: ErrorDeDominio, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof HorarioNoEncontradoError ||
      exception instanceof MiembroNoEncontradoError
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (
      exception instanceof CupoLlenoError ||
      exception instanceof InscripcionDuplicadaError
    ) {
      status = HttpStatus.CONFLICT;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
