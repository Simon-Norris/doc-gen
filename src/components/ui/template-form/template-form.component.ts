import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import {Condition, FtlTemplate, Loop, Macro, Variable} from '../interactive';
import {FaIconComponent, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faPlus, faSave, faTrash} from '@fortawesome/free-solid-svg-icons';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-template-form',
  templateUrl: './template-form.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    FaIconComponent,
    FontAwesomeModule,
    MatTooltipModule
  ],
  styleUrls: ['./template-form.component.css']
})
export class TemplateFormComponent {
  faPlus = faPlus;
  faMinus = faTrash;
  faSave = faSave;
  templateForm: FormGroup;

  @Input() extractedJsonFields!: { id: string; label: string }[];
  @Input() rawJsonData!: string;

  // Outputs to emit data to the parent component
  @Output() genVars = new EventEmitter<string>();
  @Output() genConditionals = new EventEmitter<string>();
  @Output() genLoops = new EventEmitter<string>();
  @Output() genMacros = new EventEmitter<string>();

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
    let variables = ''
    this.variables.value.forEach((variable: Variable) => {
      variables += `<#assign ${variable.name} = "${variable.value}">\n`;
    });
    this.genVars.emit(variables);
    this.toggleForm('variables');
  }

  // Save and emit conditions
  saveConditions() {
    let conditions = ''
    this.conditions.value.forEach((condition: Condition) => {
      conditions += `<#if (${condition.expression})>\n`;
      conditions += `${condition.trueBlock}\n`;
      if (condition.elseIfBlock && condition.elseIfExpression) {
        conditions += `<#elseif (${condition.elseIfExpression})>\n`;
        conditions += `${condition.elseIfBlock}\n`;
      }
      if (condition.falseBlock) {
        conditions += `<#else>\n`;
        conditions += `${condition.falseBlock}\n`;
      }
      conditions += `</#if>\n`;
    });
    this.genConditionals.emit(conditions);
    this.toggleForm('conditions'); // Hide the form after saving
  }

  // Save and emit loops
  saveLoops() {
    let iterations = ''
    this.loops.value.forEach((loop: Loop) => {
      iterations += `<#list ${loop.listVariable} as item>\n`;
      iterations += `${loop.loopBody}\n`;
      iterations += `</#list>\n`;
    });
    this.genLoops.emit(iterations);
    this.toggleForm('loops'); // Hide the form after saving
  }

  // Save and emit macros
  saveMacros() {
    let macros = ''
    this.macros.value.forEach((macro: Macro) => {
      macros += `<#macro ${macro.name}>\n`;
      macros += `${macro.body}\n`;
      macros += `</#macro>\n`;
    });
    this.genMacros.emit(macros);
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
