import { TestBed } from '@angular/core/testing';

import { TemperaturesService } from './temperatures.service';

describe('TemperaturesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TemperaturesService = TestBed.get(TemperaturesService);
    expect(service).toBeTruthy();
  });
});
