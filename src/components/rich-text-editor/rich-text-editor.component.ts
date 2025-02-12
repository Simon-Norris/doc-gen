import { Component } from '@angular/core';
import { QuillEditorComponent } from 'ngx-quill';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    QuillEditorComponent,
    FormsModule
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.css']
})
export class RichTextEditorComponent {
  editorContent = 'hi';

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
    console.log(this.editorContent);
  }
}
