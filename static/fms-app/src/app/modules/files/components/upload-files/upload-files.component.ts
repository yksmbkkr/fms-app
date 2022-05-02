import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ApiEndpoints} from "../../../../constants/api-endpoints.constant";
import {CustomApiService} from "../../../../services/custom-api.service";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {FormControl, Validators} from "@angular/forms";
import {FileService} from "../../services/file.service";

export interface ShareUser {
  uid: string;
}

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  fileAttr = 'Choose File';
  isFileValid = true;
  isFileSelected = false;
  maxSize = 5 * 1024 * 1024;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  chipInputError = false;

  fileName!: string;
  fileSize!: string;
  fileObject!: any;
  userList: ShareUser[] = [];
  invalidChipText!: string;

  apiFlags = {
    uploadingFile: false
  }

  emailFormControl = new FormControl('', [Validators.email])
  phoneFormControl = new FormControl('', [Validators.pattern('[0-9]{10}')])

  constructor(
    private apiService: CustomApiService,
    private fileService: FileService
  ) {
  }

  ngOnInit() {
  }

  addUser(event: MatChipInputEvent): void {
    if (this.userList.length > 9) {
      event.chipInput!.clear();
      return;
    }
    const value = (event.value || '').trim();

    if (value) {
      this.userList.push({uid: value});
    }

    // Clear the input value
    event.chipInput!.clear();
    this.hasChipInputError();
  }

  removeUser(usr: ShareUser): void {
    const index = this.userList.indexOf(usr);

    if (index >= 0) {
      this.userList.splice(index, 1);
    }
    this.hasChipInputError();
  }

  hasChipInputError() {
    this.chipInputError = false;
    for (const obj of this.userList) {
      this.emailFormControl.patchValue(obj.uid);
      this.phoneFormControl.patchValue(obj.uid);
      if (this.emailFormControl.invalid && this.phoneFormControl.invalid) {
        this.chipInputError = true;
        this.invalidChipText = obj.uid;
        console.log(obj)
        break;
      }
    }
  }

  uploadFileEvt(evt: any) {
    if (evt.target.files && evt.target.files[0]) {
      this.isFileSelected = true;
      this.fileAttr = evt.target?.files[0]?.name;
      let fileSize = evt.target?.files[0]?.size;
      let fileExt = this.fileAttr.split('.')[this.fileAttr.split('.').length-1]?.toLowerCase();
      if (fileSize > this.maxSize ||  (fileExt!== 'docx' && fileExt!=='pptx' && fileExt!=='xlsx')) {
        this.isFileValid = false;
        return;
      }
      this.isFileValid = true;
      this.fileName = evt.target?.files[0]?.name;
      this.fileSize = evt.target?.files[0]?.size;
      this.fileObject = evt.target?.files[0];
      // HTML5 FileReader API
      let reader = new FileReader();
      reader.readAsDataURL(evt.target.files[0]);
      this.fileInput.nativeElement.value = '';
    } else {
      this.fileAttr = 'Choose File';
    }
  }

  onUpload() {
    this.apiFlags.uploadingFile = true;
    this.apiService.postRequest(
      ApiEndpoints.getUploadUrl,
      {
        fileName: this.fileName,
        fileSize: this.fileSize,
        shareList: this.userList
      }
    ).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.uploadToS3(resp.data.postObject, resp.data.formattedFileData)
        } else {
          this.apiFlags.uploadingFile = false;
        }
      },
      error: (err: any) => {
        console.log(err);
        this.apiFlags.uploadingFile = false;
      }
    })
  }

  uploadToS3(resp:any, formattedFileData: any) {
    console.log(resp, formattedFileData)
    const formData = new FormData();
    for (const [key, value] of Object.entries(resp?.fields)) {
      formData.append(key, value as string);
    }
    formData.append("file", this.fileObject, formattedFileData.hex+'.'+formattedFileData.ext);
    console.log(resp.url)
    this.apiService.postRequest(
      resp.url,
      formData
    ).subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.apiFlags.uploadingFile = false;
        this.fileAttr = 'Choose File';
        this.fileSize = '0';
        this.fileName = '';
        this.fileObject = null;
        this.userList = [];
        this.fileService.fileUploadEvent$.next(true);
      },
      error: (err: any) => {
        console.log(err);
        this.apiFlags.uploadingFile = false;
      }
    })
  }
}
