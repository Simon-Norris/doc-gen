import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkRichTextEditorComponent } from './ck-rich-text-editor.component';

describe('CkRichTextEditorComponent', () => {
  let component: CkRichTextEditorComponent;
  let fixture: ComponentFixture<CkRichTextEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CkRichTextEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CkRichTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
