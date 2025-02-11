import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  standalone: true,
  imports: [
    FormsModule
  ],
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedWordFile: File | null = null;
  selectedJsonFile: File | null = null;
  documentId: number = 1;
  selectedFormat: string = 'word'; // Default format to Word

  constructor(private http: HttpClient) {}

  // Handles Word file selection
  onWordFileSelected(event: any) {
    this.selectedWordFile = event.target.files[0];
  }

  // Handles JSON file selection
  onJsonFileSelected(event: any) {
    this.selectedJsonFile = event.target.files[0];
  }

  // Uploads the selected Word template and JSON file to the server
  uploadFile() {
    const formData = new FormData();
    formData.append('template', this.selectedWordFile as File);
    formData.append('jsonFile', this.selectedJsonFile as File);
    this.http.post('http://localhost:9999/documents/upload', formData)
      .subscribe({
        next: (response) => {
          console.log('File uploaded successfully!', response);
          alert('Upload successful!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error uploading file:', error);
          alert(`Upload failed: ${error.message}`);
        }
      });
  }

  // Downloads the file based on document ID and selected format
  downloadFile(id: number, format: string) {
    this.http.get(`http://localhost:9999/documents/download/${format}/${id}`, { responseType: 'blob' })
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;

        // Dynamically set the download file extension based on the format
        const fileExtension = format.toLowerCase();
        let fileName = `document.${fileExtension}`;
        if (fileExtension === 'word') {
          fileName = `document.docx`;  // Word files should have a .docx extension
        } else if (fileExtension === 'html') {
          fileName = `document.html`;  // HTML files should have a .html extension
        } else if (fileExtension === 'pdf') {
          fileName = `document.pdf`;  // PDF files should have a .pdf extension
        } else if (fileExtension === 'ftl') {
          fileName= `doc.html`
        }

        // Trigger download
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error => {
        console.error('Error downloading file:', error);
        alert(`Download failed: ${error.message}`);
      });
  }
}
