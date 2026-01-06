import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationBellComponent } from './notification-bell';
import { NotificationService } from '../../services/notification.service';
import { of } from 'rxjs';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;

  beforeEach(async () => {
    const notificationServiceMock = {
      unreadCount$: of(0),
      getUnreadCount: () => of(0)
    };

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit bellClicked event when clicked', () => {
    let emitted = false;
    component.bellClicked.subscribe(() => {
      emitted = true;
    });
    component.onBellClick();
    expect(emitted).toBeTruthy();
  });
});
