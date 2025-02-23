import {Component} from '@angular/core';
import {CKEditorModule} from '@ckeditor/ckeditor5-angular';
import {FormsModule} from '@angular/forms';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-ck-rich-text-editor',
  standalone: true,
  imports: [CKEditorModule, FormsModule, NgIf],
  templateUrl: './ck-rich-text-editor.component.html',
  styleUrl: './ck-rich-text-editor.component.css'
})
export class CkRichTextEditorComponent {
  public Editor = ClassicEditor;
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
  templateName = 'Template Name 2';
  response = '';

  editorConfig = {
    licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDEzMDU1OTksImp0aSI6ImFlMzFmOTA5LWU4MjAtNGVkOC04N2UyLTg2NjQ0ZWI2MDBiZCIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjJjMGE4MTc5In0.ijT4Mpd3w9XDdvfvKSLkalmSpYb-B4jcoqhmJxSXztoPbK9Vn6t2_-77xdfRuDZWzf1wdvrdmPlhQxmPXbBEBw',
    toolbar: [
      'heading', '|', 'bold', 'italic', 'underline', 'strikeThrough', '|',
      'bulletedList', 'numberedList', '|', 'alignment', '|',
      'link', 'blockQuote', 'insertTable', 'undo', 'redo'
    ],
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
  };

  previewedContent = ''

  constructor(private http: HttpClient) {}

  saveContent() {
    if (!this.isValidJson(this.jsonData)) {
      this.response = 'Invalid JSON format';
      return;
    }

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
          this.generateContent(res.templateId)
        }
      },
      (err) => {
        console.error(err)
        this.response = 'Error processing request due to: ' + err.message
      }
    );
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

  generateContent(id: number) {
    this.http.get(`http://localhost:9999/api/v1/rich-text/generate-response/${id}`)
      .subscribe((response: any) => {
        this.previewedContent = response.response
      }, error => {
        console.error('Error downloading file:', error);
        alert(`Generate failed: ${error.message}`);
      });
  }

  isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }
}
