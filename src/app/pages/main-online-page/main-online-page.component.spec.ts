import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOnlinePageComponent } from './main-online-page.component';

describe('MainOnlinePageComponent', () => {
  let component: MainOnlinePageComponent;
  let fixture: ComponentFixture<MainOnlinePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainOnlinePageComponent]
    });
    fixture = TestBed.createComponent(MainOnlinePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
