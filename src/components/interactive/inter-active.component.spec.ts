import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterActiveComponent } from './inter-active.component';

describe('RichTextEditorComponent', () => {
  let component: InterActiveComponent;
  let fixture: ComponentFixture<InterActiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterActiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
