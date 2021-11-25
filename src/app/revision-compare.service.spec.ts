import { TestBed } from '@angular/core/testing';

import { RevisionCompareService } from './revision-compare.service';

describe('RevisionCompareService', () => {
  let service: RevisionCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RevisionCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
