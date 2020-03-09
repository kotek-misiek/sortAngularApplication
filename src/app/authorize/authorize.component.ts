import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CookieService } from "ngx-cookie-service";
import * as config from 'env.json';

@Component({
  selector: 'authorize',
  templateUrl: './authorize.component.html',
  styleUrls: ['./authorize.component.css']
})
export class AuthorizeComponent implements OnInit {
  title = "Authorization block";
  
  userName: string; 
  password: string;
  token: string;

  @Output()
  tokenEvent = new EventEmitter<string>();

  constructor(private http: HttpClient, private cookies: CookieService) { 

  }

  ngOnInit() {
    this.token = this.cookies.check("token") ? this.cookies.get("token") : undefined;
    this.userName = this.cookies.check("userName") ? this.cookies.get("userName") : "";
    if (this.password === undefined) {
      this.password = "";
    }
    this.tokenEvent.emit(this.token);
}

  authorize(event: Event) {
    if (this.checkInputParams()) {      
      let params: HttpParams = new HttpParams()
        .set("username", this.userName)
        .set("password", this.password); 
      this.http.post(config.tokenPath, params, {"responseType": "text"})
        .subscribe(
          token => {
            this.token = token;

            let expiredDate: Date = new Date();
            expiredDate.setMinutes(expiredDate.getMinutes() + config.cookiesMin);
            this.cookies.set("token", this.token, expiredDate);
            this.cookies.set("userName", this.userName, expiredDate);

            this.tokenEvent.emit(this.token);
          }, 
          error => {
            alert("error: " + error.error === undefined ? error.message : error.error);
            this.cookies.deleteAll();
            this.tokenEvent.emit(undefined);
          });
      }
  }

  logout(event: Event) {
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer " + this.token);  
    this.http.get(config.logoutPath, {headers: headers}).subscribe();

    this.token = undefined;
    this.userName = "";
    this.password = "";
    this.cookies.deleteAll();
    this.tokenEvent.emit(undefined);
  }

  private checkInputParams(): boolean {
    let isOk: boolean = true;
    if (this.userName.trim() === "") {
      isOk = false;
      alert("User name is empty");
    } else if (this.password.trim() === "") {
      isOk = false;
      alert("Password is empty");
    }
    return isOk;
  }
}
