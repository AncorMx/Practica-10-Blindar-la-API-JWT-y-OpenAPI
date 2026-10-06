import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decoradores/roles.decorator';
import { Rol, PayloadJwt } from '../dominio/usuario';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Si no hay roles requeridos, pasa
    }

    const { user } = context.switchToHttp().getRequest<{ user: PayloadJwt }>();
    
    // Verificamos si el usuario tiene alguno de los roles requeridos
    return requiredRoles.includes(user.rol);
  }
}
