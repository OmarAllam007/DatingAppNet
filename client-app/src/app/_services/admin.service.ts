import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthService} from "./AuthService";
import {environment} from "../../environments/environment.development";
import {User} from "../_models/user";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = environment.apiUrl

  constructor(private http: HttpClient) {
  }

  getUsersWithRoles() {
    return this.http.get<User[]>(this.baseUrl + 'admin/users-with-roles');
  }

  updateUserRoles(userId: number, roles: string[]) {
    return this.http.post<string[]>(this.baseUrl + 'admin/edit-roles/'
      + userId + '?roles=' + roles, {});

  }


}
