import { Injectable } from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {firstValueFrom, Observable, Subject} from "rxjs";
import firebase from "firebase/compat/app";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ApiEndpoints} from "../constants/api-endpoints.constant";
import {Router} from "@angular/router";
import {PageRoutes} from "../constants/page-routes.constant";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _isLoggedIn = false;
  private _profileData! :any;
  private _currentUser! :any;

  loginEvent$ = new Subject<boolean>();
  userChangeEvent$ = new Subject<{profileData: any, currentUser: any}>();

  constructor(
    public afAuth: AngularFireAuth,
    private http: HttpClient,
    private router: Router
  ) { }


  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  set isLoggedIn(value: boolean) {
    this._isLoggedIn = value;
    this.loginEvent$.next(value);
  }

  get profileData(): any {
    return this._profileData;
  }

  set profileData(value: any) {
    this._profileData = value;
    this.userChangeEvent$.next({profileData: this._profileData, currentUser: this._currentUser})
  }

  get currentUser(): any {
    return this._currentUser;
  }

  set currentUser(value: any) {
    this._currentUser = value;
    this.userChangeEvent$.next({profileData: this._profileData, currentUser: this._currentUser})
  }

  async setAuthStatus() {
    this.authChangeListener();
    let user = await firstValueFrom(this.afAuth.authState);
    this._currentUser = user;
    let profileData:any;
    try {
      profileData = await firstValueFrom(this.getProfileData())
    } catch (e: any) {
      profileData = {
        data: {
          isNewUser: true,
          isEmailVerified: false
        }
      }
      if (e?.status !== 403) {
        // TODO: Show Error Modal/Toast
      }
    }
    // let user = await firstValueFrom(this.obersvableTest());
    this.profileData = profileData.data;
    // @ts-ignore
    this._isNewUser = profileData['data']['isNewUser'];
    if (user) {
      this._isLoggedIn = true;
    }
    return user;
  }

  authChangeListener() {
    this.afAuth.onAuthStateChanged((nextUser) => {
      this._currentUser = nextUser;
      this._isLoggedIn = !!this._currentUser;
      console.log(this._currentUser);
    });
  }

  signOutUser() {
    this.afAuth.signOut().then((res: any) => {
      console.log(res);
      this.isLoggedIn = false;
      this.router.navigate([PageRoutes.login])
    });
  }

  getProfileData() {
    return this._getProfileDataHttpRequest();
  }

  getAccessToken(forceRefresh = false) {
    return new Promise<string>(resolve => {
      if (!this._currentUser) {
        resolve('')
      } else {
        // @ts-ignore
        this._currentUser.getIdToken(forceRefresh).then(tkn => resolve(tkn)).catch(reason => resolve(''));
      }
    })
  }

  private _getProfileDataHttpRequest() {
    return this.http.get(`${ApiEndpoints.profileData}`, {});
  }
}
