import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CookieService } from "ngx-cookie-service";
import * as config from 'env.json';

@Component({
  selector: 'sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.css']
})
export class SortComponent implements OnInit {
  title = "Array to sort generation";
  ordersData = [];
  sortEnum: String[];
  
  token: string;
  tempDisabled: boolean = true;
  waitImage: HTMLImageElement;

  avoidDuplicates = true; 
  numberOfItems: number = 10;
  maxValue: number = 10;
  generatedItems = "";
  sortField: string = "QUICK";
  asc: boolean = true;

  constructor(private http: HttpClient, private cookies: CookieService) { }

  ngOnInit() {
    this.createWaitImage();
    this.http.get(config.sortEnumPath).subscribe(data => {
      this.sortEnum = [];
      for (let num in data) {
        this.sortEnum.push(data[num]);
      }
    });
  }

  receiveToken($event) {
    this.token = $event;
    this.tempDisabled = (this.token === undefined);
  }

  extendCookies() {
    let expiredDate: Date = new Date();
    expiredDate.setMinutes(expiredDate.getMinutes() + config.cookiesMin);

    this.cookies.set("token", this.cookies.get("token"), expiredDate);
    this.cookies.set("userName", this.cookies.get("userName"), expiredDate);
  }

  generate(event: Event) {
    if (this.checkInputParams()) {
      this.showWait(<HTMLButtonElement>event.target);
      let params = new HttpParams()
        .set('avoidDuplicates', "" + this.avoidDuplicates)
        .set('n', "" + this.numberOfItems)
        .set("maxValue", "" + this.maxValue);
      let headers = new HttpHeaders()
        .set("Authorization", "Bearer " + this.token);
      
      this.http.get(config.appPath, {params: params, headers: headers})
        .subscribe(
          data => {
            this.generatedItems = "[" + data.toString() + "]";
            this.readGeneratedItems();
            this.closeWait();
          }, 
          error => {
            this.generatedItems = "[]";
            this.readGeneratedItems();
            if (error.status == 400) {
              if (error.error.message == undefined) {
                alert("Bad request: cannot avoid duplicates when max value less than number of items");
              } else {
                alert(error.error.message);
              }
            }
            this.closeWait();
          });
      this.extendCookies();    
    }
  }

  sort(event: Event) {
    this.showWait(<HTMLButtonElement>event.target);
    let params = new HttpParams()
      .set("asc", this.asc ? "true" : "false")
      .set("sort", this.sortField);
    let headers = new HttpHeaders()
      .set("Authorization", "Bearer " + this.token)
      .set("Content-Type", "application/json");
    this.http.post(config.appPath, this.generatedItems, {params: params, headers: headers})
      .subscribe(
        data => {
          this.generatedItems = "[" + data["sortedItems"] + "]";
          this.readGeneratedItems();
          this.closeWait();
        },
        error => {
          this.closeWait();
          alert(error.error.message);
        });
    this.extendCookies();    
  }

  private readGeneratedItems() {    
    (<HTMLTextAreaElement>document.getElementsByTagName("textarea")[0]).value = this.generatedItems;
  }

  private createWaitImage() {
    this.waitImage = document.createElement("img");
    this.waitImage.setAttribute("id", "waitImage");
    this.waitImage.setAttribute("src", "assets/img/wait.gif");
  }

  private showWait(button: HTMLButtonElement) {
    var size = 30;
    var top = button.getBoundingClientRect().top + button.clientHeight - size;
    var left = button.getBoundingClientRect().left + button.getBoundingClientRect().width - button.clientHeight;

    this.waitImage.setAttribute("style", "position: absolute; height: " + size + "px; width: " + size + "px; top: " + top + "px; left: " + left + "px; display: block;");
    document.body.appendChild(this.waitImage);
    
    this.tempDisabled = true;
  }

  private closeWait() {
    this.tempDisabled = false;
    document.getElementById("waitImage").remove();
  }

  private checkInputParams(): boolean {
    let isOk: boolean = true;
    if (Number.isNaN(this.numberOfItems)) {
      isOk = false;
      alert("Number of items is not a number");
    } else if (this.numberOfItems == 0) {
      isOk = false;
      alert("Number of items equals zero");
    } else if (Number.isNaN(this.maxValue)) {
      isOk = false;
      alert("Max value is not a number");
    } else if (this.maxValue == 0) {
      isOk = false;
      alert("Max value equals zero");
    } else if (this.avoidDuplicates && this.maxValue < this.numberOfItems) {
      isOk = false;
      alert("Сannot avoid duplicates when max value less than number of items");
    }
    return isOk;
  }
}
