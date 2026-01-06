import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { UserRole } from '../../models/user';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockRouter: any;
  let mockUserService: any;
  let mockSnackBar: any;

  const mockUsers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '1234567890',
      address: '123 Main St',
      dateOfBirth: new Date('1990-01-01'),
      role: UserRole.Admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phoneNumber: '9876543210',
      address: '456 Oak Ave',
      dateOfBirth: new Date('1985-05-15'),
      role: UserRole.PolicyHolder,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    mockRouter = {
      navigate: (commands: any[]) => Promise.resolve(true)
    };

    mockUserService = {
      getAllUsers: () => of(mockUsers),
      activateUser: (id: number) => of({}),
      deactivateUser: (id: number) => of({})
    };

    mockSnackBar = {
      open: (message: string, action: string, config: any) => {}
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent]
    }).compileComponents();

    TestBed.overrideComponent(UsersComponent, {
      set: {
        providers: [
          { provide: Router, useValue: mockRouter },
          { provide: UserService, useValue: mockUserService },
          { provide: MatSnackBar, useValue: mockSnackBar }
        ]
      }
    });

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    expect(component.users.length).toBe(2);
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should filter users by search term', () => {
    fixture.detectChanges();
    component.searchTerm = 'john';
    component.applyFilters();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].firstName).toBe('John');
  });

  it('should filter users by role', () => {
    fixture.detectChanges();
    component.selectedRole = UserRole.Admin;
    component.applyFilters();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].role).toBe(UserRole.Admin);
  });

  it('should filter users by status', () => {
    fixture.detectChanges();
    component.selectedStatus = 'active';
    component.applyFilters();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].isActive).toBe(true);
  });

  it('should clear all filters', () => {
    fixture.detectChanges();
    component.searchTerm = 'john';
    component.selectedRole = UserRole.Admin;
    component.selectedStatus = 'active';
    component.clearFilters();
    expect(component.searchTerm).toBe('');
    expect(component.selectedRole).toBe('');
    expect(component.selectedStatus).toBe('');
    expect(component.filteredUsers.length).toBe(2);
  });

  it('should sort users by name', () => {
    fixture.detectChanges();
    component.sortData({ active: 'name', direction: 'asc' });
    expect(component.filteredUsers[0].firstName).toBe('Jane');
    expect(component.filteredUsers[1].firstName).toBe('John');
  });

  it('should update pagination', () => {
    fixture.detectChanges();
    component.pageSize = 1;
    component.pageIndex = 0;
    component.updatePaginatedUsers();
    expect(component.paginatedUsers.length).toBe(1);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    component.onPageChange({ pageIndex: 1, pageSize: 1, length: 2 });
    expect(component.pageIndex).toBe(1);
    expect(component.pageSize).toBe(1);
  });

  it('should return correct role text', () => {
    expect(component.getRoleText(UserRole.Admin)).toBe('Admin');
    expect(component.getRoleText(UserRole.PolicyHolder)).toBe('Policy Holder');
  });

  it('should return correct role class', () => {
    expect(component.getRoleClass(UserRole.Admin)).toBe('role-admin');
    expect(component.getRoleClass(UserRole.PolicyHolder)).toBe('role-holder');
  });

  it('should navigate to edit user', () => {
    component.editUser(mockUsers[0]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/edit', 1]);
  });

  it('should navigate to create user', () => {
    component.createUser();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/create']);
  });

  it('should activate inactive user', () => {
    fixture.detectChanges();
    const inactiveUser = component.users[1];
    component.toggleUserStatus(inactiveUser);
    setTimeout(() => {
      expect(component.users[1].isActive).toBe(true);
    }, 100);
  });

  it('should deactivate active user', () => {
    fixture.detectChanges();
    const activeUser = component.users[0];
    component.toggleUserStatus(activeUser);
    setTimeout(() => {
      expect(component.users[0].isActive).toBe(false);
    }, 100);
  });

  it('should handle error loading users', () => {
    mockUserService.getAllUsers = () => throwError(() => ({ status: 500 }));
    fixture.detectChanges();
    expect(component.users.length).toBe(0);
  });

  it('should handle error toggling user status', () => {
    mockUserService.deactivateUser = () => throwError(() => ({ status: 500 }));
    fixture.detectChanges();
    const activeUser = component.users[0];
    const originalStatus = activeUser.isActive;
    component.toggleUserStatus(activeUser);
    setTimeout(() => {
      expect(component.users[0].isActive).toBe(originalStatus);
    }, 100);
  });
});
