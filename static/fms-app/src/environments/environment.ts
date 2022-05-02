// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyD-Pk7G42SqEgsYQ6zfBJzbcSR-A24gsR8",
    authDomain: "fms-app-ez.firebaseapp.com",
    projectId: "fms-app-ez",
    storageBucket: "fms-app-ez.appspot.com",
    messagingSenderId: "517612818394",
    appId: "1:517612818394:web:5570f96ef35f47b8087ae3",
    measurementId: "G-DC9LCFP0L1"
  },
  apiBase: 'https://fms.dev.yashkulshreshtha.me'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
