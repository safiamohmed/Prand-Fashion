import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { accountMatchGuard } from './account-match-guard';

describe('accountMatchGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => accountMatchGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
