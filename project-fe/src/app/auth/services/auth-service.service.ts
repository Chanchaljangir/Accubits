import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { environment } from "./../../../environments/environment";
import { CookieService } from "../../common/service/cookie.service";
@Injectable({
  providedIn: 'root'
})
export class AuthServiceService { 

  constructor( private router: Router,
    private http: HttpClient,
    private cookie: CookieService) { }

    login(loginDetails) {
      return this.http.post<any>(environment.baseURL + '/login', loginDetails)
    }

    registerUser(obj) {
      return this.http.post<any>(environment.baseURL + '/registerUser', obj)
    }
    
}
