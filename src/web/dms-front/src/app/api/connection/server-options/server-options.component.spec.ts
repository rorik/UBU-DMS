import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerOptionsComponent } from './server-options.component';

describe('ServerOptionsComponent', () => {
  let component: ServerOptionsComponent;
  let fixture: ComponentFixture<ServerOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
