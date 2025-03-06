import { Component, EventEmitter, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import {FtlTemplate} from '../interactive';
import {FaIconComponent, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faPlus, faSave, faTrash} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    FaIconComponent,
    FontAwesomeModule
  ],
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent {
  faPlus = faPlus;
  faMinus = faTrash;
  faSave = faSave;
  templateForm: FormGroup;

  // Outputs to emit data to the parent component
  @Output() genVars = new EventEmitter<any[]>();
  @Output() genConditionals = new EventEmitter<any[]>();
  @Output() genLoops = new EventEmitter<any[]>();
  @Output() genMacros = new EventEmitter<any[]>();

  // Track which form is currently visible
  activeForm: 'variables' | 'conditions' | 'loops' | 'macros' | null = null;

  constructor(private fb: FormBuilder) {
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

  // Toggle the active form
  toggleForm(form: 'variables' | 'conditions' | 'loops' | 'macros') {
    this.activeForm = this.activeForm === form ? null : form;
  }

  // Add a new variable
  addVariable() {
    this.variables.push(this.fb.group({
      name: '',
      value: ''
    }));
  }

  // Add a new condition
  addCondition() {
    this.conditions.push(this.fb.group({
      expression: '',
      trueBlock: '',
      elseIfExpression: '',
      elseIfBlock: '',
      falseBlock: ''
    }));
  }

  // Add a new loop
  addLoop() {
    this.loops.push(this.fb.group({
      listVariable: '',
      loopBody: ''
    }));
  }

  // Add a new macro
  addMacro() {
    this.macros.push(this.fb.group({
      name: '',
      body: ''
    }));
  }

  // Save and emit variables
  saveVariables() {
    this.genVars.emit(this.variables.value);
    this.toggleForm('variables'); // Hide the form after saving
  }

  // Save and emit conditions
  saveConditions() {
    this.genConditionals.emit(this.conditions.value);
    this.toggleForm('conditions'); // Hide the form after saving
  }

  // Save and emit loops
  saveLoops() {
    this.genLoops.emit(this.loops.value);
    this.toggleForm('loops'); // Hide the form after saving
  }

  // Save and emit macros
  saveMacros() {
    this.genMacros.emit(this.macros.value);
    this.toggleForm('macros'); // Hide the form after saving
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
