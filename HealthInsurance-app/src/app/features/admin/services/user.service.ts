import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, CreateUserDto, UpdateUserDto, UserRole, RegisterDto, AuthResponse } from '../models/user';

export interface UpdateUserRoleDto {
  role: UserRole;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:7075/api/users';
  private authUrl = 'https://localhost:7075/api/auth';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  searchUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/search-by-email/${encodeURIComponent(email)}`);
  }

  createUser(user: CreateUserDto): Observable<User> {
    // Use register endpoint for creating users
    const registerDto: RegisterDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      address: user.address,
      dateOfBirth: user.dateOfBirth
    };
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, registerDto)
      .pipe(
        // Extract just the user from the auth response
        map(response => response.user)
      );
  }

  updateUser(id: number, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  updateUserRole(id: number, roleDto: UpdateUserRoleDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/role`, roleDto);
  }

  activateUser(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
