import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionCompareComponent } from './revision-compare.component';

describe('RevisionCompareComponent', () => {
  let component: RevisionCompareComponent;
  let fixture: ComponentFixture<RevisionCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevisionCompareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RevisionCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
