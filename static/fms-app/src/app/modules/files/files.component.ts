import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  isStaffUser = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isStaffUser = this.authService.profileData.isStaff;
  }

}
