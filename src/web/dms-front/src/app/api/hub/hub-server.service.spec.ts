import { TestBed } from '@angular/core/testing';

import { HubServerService } from './hub-server.service';

describe('HubServerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HubServerService = TestBed.get(HubServerService);
    expect(service).toBeTruthy();
  });
});
