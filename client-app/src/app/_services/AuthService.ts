import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {BehaviorSubject, map} from "rxjs";
import {User} from "../_models/user";
import {environment} from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private httpClient: HttpClient) {
  }



  login(model: User | any) {
    return this.httpClient.post<User>(`${this.baseUrl}account/login`, model).pipe(
      map((response:any) =>{
        const user = response;

        if(user){
          localStorage.setItem('user',JSON.stringify(user));
          this.currentUserSource.next(user);
        }
      }
    ))
  }

  register(model: User | any) {
    return this.httpClient.post<User>(`${this.baseUrl}account/register`, model).pipe(
      map((response:any) =>{
        const user = response;

        if(user){
          localStorage.setItem('user',JSON.stringify(user));
          this.currentUserSource.next(user);
        }
        return user;
      }
    ))
  }

  setCurrentUser(user:User){
    this.currentUserSource.next(user);
  }
  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null) ;
  }
}
