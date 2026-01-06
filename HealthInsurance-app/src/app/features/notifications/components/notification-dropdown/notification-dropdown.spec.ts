import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationDropdownComponent } from './notification-dropdown';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;

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
      imports: [NotificationDropdownComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(NotificationDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    expect(component.notifications).toBeDefined();
  });
});
