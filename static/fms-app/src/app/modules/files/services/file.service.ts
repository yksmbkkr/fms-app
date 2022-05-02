import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable()
export class FileService {

  public fileUploadEvent$ = new Subject<boolean>();

  constructor() { }
}
