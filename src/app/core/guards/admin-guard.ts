import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(Auth).esAdmin()) ? true : router.parseUrl('/admin/login');
};
