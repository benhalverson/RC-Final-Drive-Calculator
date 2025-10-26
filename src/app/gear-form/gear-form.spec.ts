import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GearForm } from './gear-form';

describe('GearForm', () => {
  let component: GearForm;
  let fixture: ComponentFixture<GearForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GearForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GearForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
