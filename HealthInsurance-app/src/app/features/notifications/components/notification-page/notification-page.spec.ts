import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationPageComponent } from './notification-page';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';

describe('NotificationPageComponent', () => {
  let component: NotificationPageComponent;
  let fixture: ComponentFixture<NotificationPageComponent>;

  beforeEach(async () => {
    const notificationServiceMock = {
      notifications$: of([]),
      getMyNotifications: () => of([]),
      markAsRead: () => of(undefined),
      markAllAsRead: () => of(undefined)
    };
    
    const routerMock = {
      navigate: () => Promise.resolve(true)
    };

    await TestBed.configureTestingModule({
      imports: [NotificationPageComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(NotificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    expect(component.allNotifications).toBeDefined();
  });

  it('should filter notifications by type', () => {
    component.setFilter('unread');
    expect(component.selectedFilter).toBe('unread');
  });
});
