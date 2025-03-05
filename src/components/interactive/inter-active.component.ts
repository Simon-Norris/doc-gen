import {Component, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';

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
    NgForOf,
    NgClass
  ],
  templateUrl: './inter-active.component.html',
  styleUrls: ['./inter-active.component.css']
})
export class InterActiveComponent {
  editorContent = '';

  jsonData = '{\n' +
    '  "name": "John",\n' +
    '  "gender": "Male",\n' +
    '  "age": 25,\n' +
    '  "items": [\n' +
    '    {"name": "Watch"},\n' +
    '    {"name": "Earbuds"},\n' +
    '    {"name": "Laptop"}\n' +
    '  ]\n' +
    '}\n';

  templateName = 'Interactive templates';
  serverResponse = '';
  hasJsonErr = false;
  fullJsonErr: {jsonResponse:string, descriptiveJsonErr: string} = {jsonResponse: '', descriptiveJsonErr: ''};

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
  extractJsonFields(jsonData: string): void {
    try {
      const json = JSON.parse(jsonData);
      this.jsonFields = Object.keys(json).map((key) => ({
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the label for better UI
      }));
      this.hasJsonErr = false
    } catch(err: any) {
      this.fullJsonErr.jsonResponse = 'Invalid json format !!!'
      this.fullJsonErr.descriptiveJsonErr = err.toString()
      this.hasJsonErr = true
    }
  }


  saveContent() {
    if (this.hasJsonErr) return;

    let params = {
      "content": this.editorContent,
      "name": this.templateName,
      "json": this.jsonData
    }

    this.http.post('http://localhost:9999/api/v1/rich-text/create-template', params).subscribe(
      (res: any) => {
        if (res.templateId == undefined) {
          this.serverResponse = "Template was not saved";
          return;
        } else {
          this.generateFile(res.templateId);
        }
      },
      (err) => {
        console.error(err);
        this.serverResponse = 'Error processing request due to: ' + err.message;
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
}
//TODO:: 1.interactive dropdown feature right on cursor 2. handle all kind of basic syntax provided by freemarker  3. json schema validation for nested and deep objects as well in user friendly manner
