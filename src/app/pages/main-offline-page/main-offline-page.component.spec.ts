import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainOfflinePageComponent } from './main-offline-page.component';

describe('MainOfflinePageComponent', () => {
  let component: MainOfflinePageComponent;
  let fixture: ComponentFixture<MainOfflinePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainOfflinePageComponent]
    });
    fixture = TestBed.createComponent(MainOfflinePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
