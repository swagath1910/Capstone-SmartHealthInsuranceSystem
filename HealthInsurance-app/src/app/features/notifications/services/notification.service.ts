import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription, EMPTY } from 'rxjs';
import { map, tap, switchMap, takeWhile } from 'rxjs/operators';
import { Notification, NotificationResponse } from '../models/model-notification';
import { AuthService } from '../../../core/authentication/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'https://localhost:7075/api/notifications';
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private pollingInterval = 30000; // 30 seconds
  private pollingSubscription?: Subscription;
  private countPollingSubscription?: Subscription;

  constructor(private http: HttpClient, private authService: AuthService) {
    // Listen to auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.stopPolling();
        this.clearNotifications();
      }
    });
  }

  getMyNotifications(): Observable<Notification[]> {
    if (!this.authService.isAuthenticated()) {
      return EMPTY;
    }
    
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/my-notifications`).pipe(
      map(notifications => notifications.map(n => ({
        ...n,
        userId: 0, // Will be set from backend
        createdAt: new Date(n.createdAt)
      }))),
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/mark-read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const notification = notifications.find(n => n.notificationId === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          this.notificationsSubject.next([...notifications]);
          this.updateUnreadCount();
        }
      })
    );
  }

  getUnreadCount(): Observable<number> {
    if (!this.authService.isAuthenticated()) {
      return EMPTY;
    }
    
    return this.http.get<number>(`${this.apiUrl}/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count))
    );
  }

  markAllAsRead(): Observable<void> {
    const unreadNotifications = this.notificationsSubject.value.filter(n => !n.isRead);
    
    // Mark all as read sequentially
    return new Observable(observer => {
      Promise.all(unreadNotifications.map(n => 
        this.http.put<void>(`${this.apiUrl}/${n.notificationId}/mark-read`, {}).toPromise()
      )).then(() => {
        // Update local state
        const notifications = this.notificationsSubject.value.map(n => ({
          ...n,
          isRead: true
        }));
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);
        observer.next();
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  startPolling(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    
    // Stop any existing polling
    this.stopPolling();
    
    // Initial load
    this.getMyNotifications().subscribe();
    this.getUnreadCount().subscribe();

    // Poll every 30 seconds - fetch both notifications and count
    this.pollingSubscription = interval(this.pollingInterval).pipe(
      takeWhile(() => this.authService.isAuthenticated()),
      switchMap(() => this.getMyNotifications())
    ).subscribe();
    
    // Also poll unread count separately for redundancy
    this.countPollingSubscription = interval(this.pollingInterval).pipe(
      takeWhile(() => this.authService.isAuthenticated()),
      switchMap(() => this.getUnreadCount())
    ).subscribe();
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
    if (this.countPollingSubscription) {
      this.countPollingSubscription.unsubscribe();
      this.countPollingSubscription = undefined;
    }
  }

  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  refreshNotifications(): void {
    if (this.authService.isAuthenticated()) {
      this.getMyNotifications().subscribe();
    }
  }

  deleteNotificationsByPolicy(policyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/by-policy/${policyId}`);
  }
}
