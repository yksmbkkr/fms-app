import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilesRoutingModule } from './files-routing.module';
import { FilesComponent } from './files.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { FilesListComponent } from './components/files-list/files-list.component';
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {FileService} from "./services/file.service";


@NgModule({
  declarations: [
    FilesComponent,
    UploadFilesComponent,
    FilesListComponent
  ],
  imports: [
    CommonModule,
    FilesRoutingModule,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule
  ],
  providers: [FileService]
})
export class FilesModule { }
