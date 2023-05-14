import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChatDialogComponent } from './edit-chat-dialog.component';

describe('EditChatDialogComponent', () => {
  let component: EditChatDialogComponent;
  let fixture: ComponentFixture<EditChatDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditChatDialogComponent]
    });
    fixture = TestBed.createComponent(EditChatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
