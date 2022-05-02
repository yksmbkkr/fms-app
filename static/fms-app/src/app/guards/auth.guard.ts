import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../services/auth.service";
import {PageRoutes} from "../constants/page-routes.constant";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.authService.isLoggedIn) {
      return this.router.parseUrl('/auth')
    }
    if (state.url?.includes('auth') || state.url?.includes('logout') || state.url?.includes('profile')) {
      return true;
    } else if (this.authService.profileData?.isNewUser || !this.authService.profileData?.isEmailVerified) {
      return this.router.parseUrl(PageRoutes.profile);
    }
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.authService.isLoggedIn) {
      return this.router.parseUrl('/auth')
    }
    if (route.path?.includes('auth') || route.path?.includes('logout') || route.path?.includes('profile')) {
      return true;
    } else if (this.authService.profileData?.isNewUser || !this.authService.profileData?.isEmailVerified) {
      return this.router.parseUrl(PageRoutes.profile);
    }
    return true;
  }
}
