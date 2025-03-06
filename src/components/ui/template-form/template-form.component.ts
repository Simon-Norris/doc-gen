import {Component} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FtlTemplate} from '../interactive';
import {BackendService} from '../backend.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent {
  templateForm: FormGroup;
  previewOutput: string = '';

  constructor(private fb: FormBuilder, private backendService: BackendService) {
    this.templateForm = this.fb.group({
      variables: this.fb.array([]),
      conditions: this.fb.array([]),
      loops: this.fb.array([]),
      macros: this.fb.array([])
    });
  }

  get variables(): FormArray {
    return this.templateForm.get('variables') as FormArray;
  }

  get conditions(): FormArray {
    return this.templateForm.get('conditions') as FormArray;
  }

  get loops(): FormArray {
    return this.templateForm.get('loops') as FormArray;
  }

  get macros(): FormArray {
    return this.templateForm.get('macros') as FormArray;
  }

  addVariable() {
    this.variables.push(this.fb.group({
      name: '',
      value: ''
    }));
  }

  addCondition() {
    this.conditions.push(this.fb.group({
      expression: '',
      trueBlock: '',
      elseIfExpression: '',
      elseIfBlock: '',
      falseBlock: ''
    }));
  }

  addLoop() {
    this.loops.push(this.fb.group({
      listVariable: '',
      loopBody: ''
    }));
  }

  addMacro() {
    this.macros.push(this.fb.group({
      name: '',
      body: ''
    }));
  }


  generateFtlTemplate(): string {
    const template = this.templateForm.value as FtlTemplate;
    let ftlTemplate = '';

    // Add variables
    template.variables.forEach(variable => {
      ftlTemplate += `<#assign ${variable.name} = "${variable.value}">\n`;
    });

    // Add conditions
    template.conditions.forEach(condition => {
      ftlTemplate += `<#if (${condition.expression})>\n`;
      ftlTemplate += `${condition.trueBlock}\n`;
      if (condition.elseIfBlock && condition.elseIfExpression) {
        ftlTemplate += `<#elseif (${condition.elseIfExpression})>\n`;
        ftlTemplate += `${condition.elseIfBlock}\n`;
      }
      if (condition.falseBlock) {
        ftlTemplate += `<#else>\n`;
        ftlTemplate += `${condition.falseBlock}\n`;
      }
      ftlTemplate += `</#if>\n`;
    });

    // Add loops
    template.loops.forEach(loop => {
      ftlTemplate += `<#list ${loop.listVariable} as item>\n`;
      ftlTemplate += `${loop.loopBody}\n`;
      ftlTemplate += `</#list>\n`;
    });

    // Add macros
    template.macros.forEach(macro => {
      ftlTemplate += `<#macro ${macro.name}>\n`;
      ftlTemplate += `${macro.body}\n`;
      ftlTemplate += `</#macro>\n`;
    });

    return ftlTemplate;
  }
}
