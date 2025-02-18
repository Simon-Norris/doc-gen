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
  editorContent = 'Hello, ${name}\n' +
    '\n' +
    '<#if (age < 18)>\n' +
    '    You are a minor.\n' +
    '<#elseif (age <= 60)>\n' +
    '    You are an adult.\n' +
    '<#else>\n' +
    '    You are a senior citizen.\n' +
    '</#if>\n' +
    '\n' +
    'Items:\n' +
    '<#list items as item>\n' +
    '    ${item_index + 1}. ${item.name}\n' +
    '</#list>';
  jsonData = '{\n' +
    '  "name": "John",\n' +
    '  "age": 25,\n' +
    '  "items": [\n' +
    '    {"name": "Watch"},\n' +
    '    {"name": "Earbuds"},\n' +
    '    {"name": "Laptop"}\n' +
    '  ]\n' +
    '}\n';
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

      this.http.post('http://localhost:9999/api/v1/rich-text/create-template', params).subscribe(
        (res: any) => {
          if (res.templateId == undefined || res.templateId == null) {
            this.response= "Template was not saved"
            return
          } else {
            this.generateFile(res.templateId)
          }
        },
        (err) => {
          console.error(err)
          this.response = 'Error processing request due to: ' + err.message
        }
      );

    } catch (error) {
      this.response='Invalid json format'
    }
  }

  generateFile(id: number) {
    this.http.get(`http://localhost:9999/api/v1/rich-text/generate/${id}`, { responseType: 'blob' })
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;

        a.download = "output.html";
        a.click();
        URL.revokeObjectURL(objectUrl);
      }, error => {
        console.error('Error downloading file:', error);
        alert(`Download failed: ${error.message}`);
      });
  }
}
