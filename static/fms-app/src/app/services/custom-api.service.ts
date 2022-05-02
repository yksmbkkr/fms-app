import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CustomApiService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getRequest(url: string,
             params?: HttpParams|{[param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>},
             headers?: HttpHeaders | {[header: string]: string | string[]},
  ): any {
    let optionObj: any = this.makeHttpOptionObj(params, headers)

    return this.http.get(this.getCompleteUrl(url), optionObj)
  }

  postRequest(url: string,
              body: Object,
              params?: HttpParams|{[param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>},
              headers?: HttpHeaders | {[header: string]: string | string[]},
  ) {
    let optionObj: any = this.makeHttpOptionObj(params, headers)

    return this.http.post(this.getCompleteUrl(url), body, optionObj)
  }

  getCompleteUrl(path: string): string {
    if (path.includes('https://') || path.includes('http://')) {
      return path
    }
    // return `${environment.apiBase}${path}`
    return `${path}`
  }

  makeHttpOptionObj(
    params?: HttpParams|{[param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>},
    headers?: HttpHeaders | {[header: string]: string | string[]},
  ) {
    let optionObj: any = {}
    if (params) {
      optionObj['params'] = params
    }
    if (headers) {
      optionObj['headers'] = {
        ...headers
      }
    }
    return optionObj;
  }
}
