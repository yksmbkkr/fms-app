import { Component, OnInit } from '@angular/core';
import {CustomApiService} from "../../../../services/custom-api.service";
import {ApiEndpoints} from "../../../../constants/api-endpoints.constant";
import {PageRoutes} from "../../../../constants/page-routes.constant";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../../services/auth.service";
import {FileService} from "../../services/file.service";

@Component({
  selector: 'app-files-list',
  templateUrl: './files-list.component.html',
  styleUrls: ['./files-list.component.scss']
})
export class FilesListComponent implements OnInit {

  files!: any[];
  apiFlags = {
    loading: false
  }
  uname = '';

  constructor(
    private apiService: CustomApiService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.uname = this.authService.profileData.firstName + ' ' + this.authService.profileData.lastName
    this.getFiles();
    this.route.queryParams.subscribe((params: any) => {
      const fid = params.fid;
      if (fid) {
        this._viewFile(fid);
      }
    })
    this.fileService.fileUploadEvent$.subscribe(e => {
      if (e) {
        this.getFiles();
      }
    })
  }

  getFiles() {
    this.apiFlags.loading = true;
    this.apiService.getRequest(
      ApiEndpoints.getFiles
    ).subscribe({
      next: (resp: any) => {
        this.apiFlags.loading = false;
        if (resp.success) {
          this.files = resp.data;
          this.files = this.files.sort(((a, b) => a.createdOn > b.createdOn ? -1 : 1))
        }
      },
      error: () => {
        this.apiFlags.loading = false;
      }
    })
  }

  getFileName(filepath: string) {
    let retVal = filepath.split('/')[filepath.split('/').length-1]
    if (retVal.length > 40) {
      let ext = filepath.split('.')[filepath.split('.').length-1]
      return retVal.slice(0,31) + '....'+ext
    }
    return filepath.split('/')[filepath.split('/').length-1].slice(0, 40);
  }

  viewFile(e: MouseEvent, fileId: any, filepath: string) {
    e.stopPropagation();
    e.preventDefault();
    this._viewFile(fileId, filepath);
  }

  private _viewFile(fileId: any, filepath?: string) {
    this.apiFlags.loading = true;
    this.apiService.getRequest(
      ApiEndpoints.getFile+fileId+'/',
      {}, {
        'Access-Control-Expose-Headers': 'Set-Cookie',
        'Access-Control-Allow-Headers':'Set-Cookie'
      }
    ).subscribe({
      next: (resp: any) => {
        this.apiFlags.loading = false;
        if (resp.success) {
          this.openFile(resp?.data?.fileUrl)
        }
      },
      error: () => {
        this.apiFlags.loading = false;
      }
    })
  }

  openFile(url: string) {
    // url = `${window.location.protocol}//${window.location.host}/${url}`;
    // this.apiService.getRequest(
    //   url
    // ).subscribe({
    //   next: (resp: any) => {
    //     window.open(resp?.data?.fileUrl, '_blank')
    //   }
    // })

    if (url) {
      window.open(url, '_blank')
    }
  }

  getFileHref(fileUid: string) {
    return `${PageRoutes.files}?fid=${fileUid}`
  }
}
