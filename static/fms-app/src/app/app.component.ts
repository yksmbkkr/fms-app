import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {PageRoutes} from "./constants/page-routes.constant";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'fms-app';

  PageRoutes = PageRoutes
  isStaffUser = false;

  constructor(
    public authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.isStaffUser = this.authService.profileData?.isStaff
  }
}
