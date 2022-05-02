import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {AuthService} from "./../auth.service";
import {Observable, from, switchMap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor{

  constructor(
    private authService: AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.getAccessToken())
      .pipe(switchMap(accessToken => {
        if (req.url.includes('amazonaws.com')) {
          return next.handle(req);
        } else if (req.url.includes('cdn')) {
          const modifiedReq = req.clone({
            withCredentials: true
          })
          return next.handle(modifiedReq);
        }
        const modifiedReq = req.clone({
          headers: req.headers.set(
            'Authorization', 'Token ' + accessToken
          )

        })
        return next.handle(modifiedReq);
      }))
  }
}
