import {HttpClient, HttpParams} from "@angular/common/http";
import {PaginatedResults} from "./pagination";
import {map} from "rxjs";

export function getPaginatedResults<T>(url: string, params: HttpParams,http:HttpClient) {
  const paginatedResult: PaginatedResults<T> = new PaginatedResults<T>();

  return http.get<T>(url, {observe: "response", params}).pipe(
    map(response => {
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

export  function getPaginatedHeader(pageNumber: number, pageSize: number) {
  let params = new HttpParams();

  params = params.append("pageNumber", pageNumber);
  params = params.append("pageSize", pageSize);

  return params;
}
