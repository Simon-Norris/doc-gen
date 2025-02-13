import { Component } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    QuillEditorComponent,
    FormsModule,
    NgIf
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css']
})
export class RichTextEditorComponent {
  editorContent = 'hi';
  jsonData = '{}';
  templateName = 'Template Name';
  response = '';

  constructor(private http: HttpClient) {}

  editorConfig = {
    toolbar: [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['image'],
    ],
    modules: {
      imageResize: {},
    },
  };

  saveContent() {
    try {
      JSON.parse(this.jsonData);

      let params = {
        "content": this.editorContent,
        "name": this.templateName,
        "json": this.jsonData
      }

      this.http.post('http://localhost:9999/documents/create-rich-template', params).subscribe(
        (res: any) => {
          if (res.templateId == undefined || res.templateId == null) {
            this.response= "Template was not saved"
            return
          } else {
            this.generateFile(res.templateId)
          }
        },
        (err) => this.response = 'Error processing request due to: ' + err.message
      );

    } catch (error) {
      this.response='Invalid json format'
    }
  }

  generateFile(id: number) {
    this.http.get(`http://localhost:9999/documents/generate/${id}`, { responseType: 'blob' })
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;

        a.download = "generated.txt";
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error => {
        console.error('Error downloading file:', error);
        alert(`Download failed: ${error.message}`);
      });
  }
}
