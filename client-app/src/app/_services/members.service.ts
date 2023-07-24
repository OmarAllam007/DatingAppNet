import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Member} from "../_models/member";
import {map, of, take} from "rxjs";
import {PaginatedResults} from "../_models/pagination";
import {UserParams} from "../_models/userParams";
import {AuthService} from "./AuthService";
import {User} from "../_models/user";

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = []
  cachedMembers = new Map();
  userParams:UserParams | undefined;
  user:User | undefined;

  constructor(private http: HttpClient, private authService:AuthService) {
    this.authService.currentUser$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          this.userParams = new UserParams(user);
          this.user = user;
        }
      }
    })
  }

  getUserParams(){
    return this.userParams;
  }

  setUserParams(params:UserParams){
    this.userParams = params;
  }

  resetFilters(){
    if(this.user){
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }

    return;
  }

  getMembers(userParams: UserParams) {
    let key = Object.values(userParams).join('-');

    const response = this.cachedMembers.get(key);

    if(response) return of(response);

    let params = this.getPaginatedHeader(userParams.pageNumber, userParams.pageSize);

    params = params.append("minAge",userParams.minAge);
    params = params.append("maxAge",userParams.maxAge);
    params = params.append("gender",userParams.gender);
    params = params.append("orderBy",userParams.orderBy);

    return this.getPaginatedResults<Member[]>(this.baseUrl + 'users', params).pipe(
      map(response=>{
        this.cachedMembers.set(key,response);
        return response;
      })
    )
  }

  getMember(username: string) {
    const member = [...this.cachedMembers.values()]
      .reduce((prevArray:[],element)=> prevArray.concat(element.result),[])
      .find((member:Member)=> member.userName === username);

    if (member) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...member};
      })
    );
  }

  updateMainImage(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  removeUserImage(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/remove-user-photo/' + photoId);
  }



  private getPaginatedResults<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResults<T> = new PaginatedResults<T>();

    return this.http.get<T>(url, {observe: "response", params}).pipe(
      map(response => {
        console.log(response.body)
        if (response.body) {
          paginatedResult.result = response.body;
        }
        let pagination = response.headers.get("Pagination");

        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        return paginatedResult;
      })
    )
  }

  private getPaginatedHeader(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);

    return params;
  }


}
