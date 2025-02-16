import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FileUploadComponent} from '../components/file-upload/file-upload.component';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HttpClientModule, FileUploadComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'doc-gen';
}
