import {Component, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from 'ngx-quill';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {TemplateFormComponent} from '../ui/template-form/template-form.component';

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
    NgClass,
    TemplateFormComponent
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
  @ViewChild(TemplateFormComponent) expressionComponent!: TemplateFormComponent;
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
    this.extractJsonFields(this.jsonData)
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
      this.jsonFields = this.extractLeafNodes(json);
      // this.jsonFields = Object.keys(json).map((key) => ({
      //   id: key,
      //   label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize the label for better UI
      // }));
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

  extractLeafNodes(obj: any, prefix: string = '', context: string = '', result: { id: string, label: string }[] = []): { id: string, label: string }[] {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key; // Build the full key path
        const value = obj[key];

        // If the value is a primitive, add it to the result
        if (typeof value !== 'object' || value === null) {
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          const displayLabel = context ? `${label} (${context})` : label; // Add context if provided
          result.push({
            id: fullKey,
            label: displayLabel,
          });
        }

        // If the value is an object, recursively extract its fields
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          this.extractLeafNodes(value, fullKey, key, result); // Pass the current key as context
        }

        // If the value is an array, iterate through its items
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              this.extractLeafNodes(item, `${fullKey}[${index}]`, `Item ${index + 1}`, result); // Add item index as context
            }
          });
        }
      }
    }
    return result;
  }

  onVariablesSaved(variables: string) {
    console.log('Variables Saved:', variables);
    this.dynamicInsertionOfExpressions(variables)
  }

  onConditionsSaved(conditions: string) {
    console.log('Conditions Saved:', conditions);
    this.dynamicInsertionOfExpressions(conditions)
  }

  onLoopsSaved(loops: string) {
    console.log('Loops Saved:', loops);
    this.dynamicInsertionOfExpressions(loops)
  }

  onMacrosSaved(macros: string) {
    console.log('Macros Saved:', macros);
    this.dynamicInsertionOfExpressions(macros)
  }

  dynamicInsertionOfExpressions(textToInsert: string) {
    const quillEditor = this.quill.quillEditor;

    if (this.cursorPosition) {
      quillEditor.setSelection(this.cursorPosition.index, this.cursorPosition.length);
      quillEditor.insertText(this.cursorPosition.index, textToInsert);
    }
  }

}
//TODO::  1. handle all kind of basic syntax provided by freemarker  2. json schema validation for nested and deep objects as well in user friendly manner
