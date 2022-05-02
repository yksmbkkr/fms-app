import { TestBed } from '@angular/core/testing';

import { CustomApiService } from './custom-api.service';

describe('CustomApiService', () => {
  let service: CustomApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
