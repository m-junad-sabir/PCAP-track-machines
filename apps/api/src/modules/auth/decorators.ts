import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export type Role = 'field_engineer' | 'project_lead' | 'pcap_admin' | 'system_admin';
export const REVIEWERS: Role[] = ['project_lead', 'pcap_admin', 'system_admin'];
export interface AuthUser { sub: string; username: string; role: Role }

export const Public = () => SetMetadata('public', true);
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
export const CurrentUser = createParamDecorator(
  (_d: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
