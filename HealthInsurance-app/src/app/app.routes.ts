import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/components/home/home';
import { LoginComponent } from './features/auth/components/login/login';
import { RegisterComponent } from './features/auth/components/register/register';
import { DashboardComponent } from './features/home/components/dashboard/dashboard';
import { PoliciesComponent } from './features/policies/components/policies/policies';
import { MyPoliciesComponent } from './features/policies/components/my-policies/my-policies';
import { PolicyFormComponent } from './features/policies/components/policy-form/policy-form';
import { PolicyDetailComponent } from './features/policies/components/policy-details/policy-detail';
import { ClaimsComponent } from './features/claims/components/claims/claims';
import { MyClaimsComponent } from './features/claims/components/my-claims/my-claims';
import { CreateClaimComponent } from './features/claims/components/create-claim/create-claim';
import { ClaimDetailComponent } from './features/claims/components/claim-detail/claim-detail';
import { HospitalClaimsComponent } from './features/claims/components/hospital-claims/hospital-claims';
import { PaymentsComponent } from './features/payments/components/payments/payments';
import { PaymentHistoryComponent } from './features/payments/components/payment-history/payment-history';
import { InsurancePlansComponent } from './features/admin/components/insurance-plans/insurance-plans';
import { InsurancePlanFormComponent } from './features/admin/components/insurance-plan-form/insurance-plan-form';
import { HospitalsComponent } from './features/admin/components/hospitals/hospitals';
import { HospitalFormComponent } from './features/admin/components/hospitals-form/hospital-form';
import { UsersComponent } from './features/admin/components/users/users';
import { UserFormComponent } from './features/admin/components/user-form/user-form';
import { ReportsComponent } from './features/reports/components/reports/reports';
import { NotificationPageComponent } from './features/notifications/components/notification-page/notification-page';
import { authGuard } from './core/authentication/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'policies', component: PoliciesComponent, canActivate: [authGuard] },
  { path: 'policies/create', component: PolicyFormComponent, canActivate: [authGuard] },
  { path: 'policies/edit/:id', component: PolicyFormComponent, canActivate: [authGuard] },
  { path: 'policies/:id', component: PolicyDetailComponent, canActivate: [authGuard] },
  { path: 'my-policies', component: MyPoliciesComponent, canActivate: [authGuard] },
  { path: 'claims', component: ClaimsComponent, canActivate: [authGuard] },
  { path: 'claims/create', component: CreateClaimComponent, canActivate: [authGuard] },
  { path: 'claims/:id', component: ClaimDetailComponent, canActivate: [authGuard] },
  { path: 'my-claims', component: MyClaimsComponent, canActivate: [authGuard] },
  { path: 'hospital-claims', component: HospitalClaimsComponent, canActivate: [authGuard] },
  { path: 'payments', component: PaymentsComponent, canActivate: [authGuard] },
  { path: 'payment-history', component: PaymentHistoryComponent, canActivate: [authGuard] },
  { path: 'insurance-plans', component: InsurancePlansComponent, canActivate: [authGuard] },
  { path: 'insurance-plans/create', component: InsurancePlanFormComponent, canActivate: [authGuard] },
  { path: 'insurance-plans/edit/:id', component: InsurancePlanFormComponent, canActivate: [authGuard] },
  { path: 'hospitals', component: HospitalsComponent, canActivate: [authGuard] },
  { path: 'hospitals/create', component: HospitalFormComponent, canActivate: [authGuard] },
  { path: 'hospitals/edit/:id', component: HospitalFormComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'users/create', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
