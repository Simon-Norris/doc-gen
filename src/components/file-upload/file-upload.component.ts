import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedWordFile: File | null = null;
  selectedJsonFile: File | null = null;

  constructor(private http: HttpClient) {}

  onWordFileSelected(event: any) {
    this.selectedWordFile = event.target.files[0];
  }

  onJsonFileSelected(event: any) {
    this.selectedJsonFile = event.target.files[0];
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('template', this.selectedWordFile as File);
    formData.append('jsonFile', this.selectedJsonFile as File);
    this.http.post('http://localhost:9999/documents/upload', formData)
      .subscribe(response => console.log('File uploaded!', response));
  }

  downloadFile(format: string) {
    this.http.get(`http://localhost:9999/documents/download/${format}`, { responseType: 'blob' })
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `document.${format}`;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }
}
