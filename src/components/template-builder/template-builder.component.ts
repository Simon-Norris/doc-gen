import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {EditorComponent} from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-template-builder',
  templateUrl: './template-builder.component.html',
  standalone: true,
  imports: [
    EditorComponent
  ],
  styleUrls: ['./template-builder.component.css']
})
export class TemplateBuilderComponent {
  templateForm: FormGroup;
  jsonData = {
    name: 'John',
    age: 30,
    address: {
      city: 'New York',
      country: 'USA'
    },
    items: ['Apple', 'Banana', 'Cherry']
  };

  constructor(private fb: FormBuilder) {
    this.templateForm = this.fb.group({
      template: ''
    });
  }

  insertVariable(variable: string) {
    const currentTemplate = this.templateForm.get('template').value;
    this.templateForm.get('template').setValue(`${currentTemplate} \${${variable}}`);
  }

  insertCondition(condition: string) {
    const currentTemplate = this.templateForm.get('template').value;
    this.templateForm.get('template').setValue(`${currentTemplate} <#if ${condition}></#if>`);
  }

  insertLoop(loop: string) {
    const currentTemplate = this.templateForm.get('template').value;
    this.templateForm.get('template').setValue(`${currentTemplate} <#list ${loop} as item></#list>`);
  }
}
