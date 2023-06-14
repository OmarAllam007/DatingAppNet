import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import {NavigationExtras, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error) {
          switch (error.status) {
            //validation error
            case 400:
              let validationErrors = error.error.errors;
              if (validationErrors) {
                const modalStateErrors = [];
                for (const modalStateErrorsKey in validationErrors) {
                  if (validationErrors[modalStateErrorsKey]) {
                    modalStateErrors.push(validationErrors[modalStateErrorsKey]);
                  }
                }

                throw modalStateErrors;
              } else {
                this.toastr.error(error.error, error.status.toString());
              }
              break;
            case 401:
              this.toastr.error("Unauthorized", error.status.toString());
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;

            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}};
              this.router.navigateByUrl('/server-error', navigationExtras);
              break;

            default:
              this.toastr.error("System error");
              console.log(error);
              break;

          }

        }

        throw error;
      })
    );


  }
}
