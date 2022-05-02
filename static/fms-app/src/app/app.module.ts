import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {AngularFireModule} from "@angular/fire/compat";
import {environment} from "../environments/environment";
import {AngularFireAuthModule, PERSISTENCE, USE_DEVICE_LANGUAGE} from "@angular/fire/compat/auth";
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptorService} from "./services/interceptors/auth-interceptor.service";
import {AppInitService} from "./services/app-init.service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

export function initializeAppFunc(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.init();
  }
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    MatSnackBarModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [
    AppInitService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFunc,
      deps: [AppInitService],
      multi: true
    },
    { provide: PERSISTENCE, useValue: 'local' },
    { provide: USE_DEVICE_LANGUAGE, useValue: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
