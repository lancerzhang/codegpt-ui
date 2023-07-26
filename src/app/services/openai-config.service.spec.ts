import { TestBed } from '@angular/core/testing';

import { OpenaiConfigService } from './openai-config.service';

describe('OpenaiConfigService', () => {
  let service: OpenaiConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenaiConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
