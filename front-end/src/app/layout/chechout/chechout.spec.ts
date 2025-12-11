import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chechout } from './chechout';

describe('Chechout', () => {
  let component: Chechout;
  let fixture: ComponentFixture<Chechout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chechout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chechout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
