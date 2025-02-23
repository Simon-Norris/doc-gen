import {RouterModule, Routes} from '@angular/router';
import {FileUploadComponent} from '../components/file-upload/file-upload.component';
import {RichTextEditorComponent} from '../components/rich-text-editor/rich-text-editor.component';
import {NgModule} from '@angular/core';
import {CkRichTextEditorComponent} from '../components/ck-rich-text-editor/ck-rich-text-editor.component';

export const routes: Routes = [
  { path: '', redirectTo: 'file-upload', pathMatch: 'full' },
  { path: 'file-upload', component: FileUploadComponent },
  { path: 'editor', component: RichTextEditorComponent },
  { path: 'ck-editor', component: CkRichTextEditorComponent },
  { path: '**', redirectTo: 'file-upload' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutes { }
