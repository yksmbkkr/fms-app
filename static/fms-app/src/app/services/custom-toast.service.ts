import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class CustomToastService {

  constructor(
    private _snackBar: MatSnackBar
  ) { }

  simpleToastMessage(message: string, duration=1500) {
    this._snackBar.open(message, 'Ok', {
      duration: duration
    })
  }
}
