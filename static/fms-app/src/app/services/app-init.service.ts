import { Injectable } from '@angular/core';
import {AuthService} from "./auth.service";

@Injectable()
export class AppInitService {

  constructor(
    private authService: AuthService
  ) { }

  init() {
    let hasInitializedPromise = new Promise<void>(async (resolve, reject) => {
      let user = await this.authService.setAuthStatus();
      console.log(user);
      resolve();
    })
    return hasInitializedPromise;
  }
}
