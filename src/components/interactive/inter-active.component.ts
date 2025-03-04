import {Component, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgForOf, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-interactive',
  standalone: true,
  imports: [
    QuillEditorComponent,
    FormsModule,
    HttpClientModule,
    NgIf,
    QuillModule,
    NgStyle,
    NgForOf
  ],
  templateUrl: './inter-active.component.html',
  styleUrls: ['./inter-active.component.css']
})
export class InterActiveComponent {
  editorContent = '';

  jsonData = '{\n' +
    '  "name": "John",\n' +
    '  "age": 25,\n' +
    '  "items": [\n' +
    '    {"name": "Watch"},\n' +
    '    {"name": "Earbuds"},\n' +
    '    {"name": "Laptop"}\n' +
    '  ]\n' +
    '}\n';

  templateName = 'Interactive templates';
  response = '';

  jsonFields: { id: string, label: string }[] = [];
  showJsonSelector: boolean = false; // To control the dropdown visibility
  dropdownPosition: any = {}; // To dynamically set dropdown position
  @ViewChild(QuillEditorComponent) quill!: QuillEditorComponent;
  cursorPosition: { index: number, length: number } | null = null;

  constructor(private http: HttpClient) { }

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
  listenOnCtrlSpace($event: any): void {
    $event.preventDefault();
    this.showJsonFieldSelector();
  }

  showJsonFieldSelector(): void {
    this.jsonFields = this.extractJsonFields(this.jsonData)
    this.showJsonSelector = true;
    const selection = this.quill.quillEditor?.getSelection();

    if (selection) {
      this.cursorPosition = { index: selection.index, length: selection.length };
    }
    const editorBounds = this.quill.quillEditor?.root?.getBoundingClientRect();
    if (editorBounds) {
      this.dropdownPosition = {
        top: `${editorBounds.bottom + 5}px`, // position just below the editor
        left: `${editorBounds.left}px`,
      };
    }
  }

  insertJsonField(field: { id: string, label: string }): void {
    const quillEditor = this.quill.quillEditor;

    if (this.cursorPosition) {
      quillEditor.setSelection(this.cursorPosition.index, this.cursorPosition.length);

      const textToInsert = `\${${field.id}}`;
      quillEditor.insertText(this.cursorPosition.index, textToInsert);
      this.showJsonSelector = false;
    }
  }

  // Load JSON fields dynamically from jsonData
  extractJsonFields(jsonData: string): { id: string, label: string }[] {
    try {
      const json = JSON.parse(jsonData);
      return Object.keys(json).map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the label for better UI
      }));
    } catch {
      return [];
    }
  }


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
          this.response = "Template was not saved";
          return;
        } else {
          this.generateFile(res.templateId);
        }
      },
      (err) => {
        console.error(err);
        this.response = 'Error processing request due to: ' + err.message;
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

  isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }
}
