import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionHttpComponent } from './action-http.component';

describe('ActionHttpComponent', () => {
  let component: ActionHttpComponent;
  let fixture: ComponentFixture<ActionHttpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionHttpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionHttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
