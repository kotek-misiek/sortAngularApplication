import * as tslib_1 from "tslib";
import { Component, NgModule } from '@angular/core';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import * as config from 'env.json';
let SortGenerationComponent = class SortGenerationComponent {
    constructor(http) {
        this.http = http;
        this.title = "Sort generation";
        this.ordersData = [];
        this.tempDisabled = false;
        this.avoidDuplicates = true;
        this.numberOfItems = 10;
        this.maxValue = 10;
        this.generatedItems = "";
        this.sortField = "QUICK";
        this.asc = true;
    }
    ngOnInit() {
        this.http.get(config.appPath + "/enums/").subscribe(data => {
            this.sortEnum = [];
            for (let num in data) {
                this.sortEnum.push(data[num]);
            }
        });
    }
    selectSort(event) {
        this.sortField = event.target.value;
    }
    toogleAvoidDuplicatess(event) {
        this.avoidDuplicates = !this.avoidDuplicates;
    }
    toogleAsc(event) {
        this.asc = !this.asc;
    }
    ajustNumberOfItems(event) {
        this.numberOfItems = +event.target.value;
    }
    ajustMaxValue(event) {
        this.maxValue = +event.target.value;
    }
    ajustGeneratedItems(event) {
        this.generatedItems = event.target.value;
    }
    showImage(top, left) {
        var waitImage = document.createElement("img");
        waitImage.setAttribute("id", "waitImage");
        waitImage.setAttribute("src", "assets/img/wait.gif");
        waitImage.setAttribute("style", "position: relative; height: 30px; width: 30px; top: " + top + "px; left: " + left + "px; display: block;");
        document.body.appendChild(waitImage);
    }
    showWait(option) {
        this.tempDisabled = true;
        if (option == "generate") {
            this.showImage(-225, 220);
        }
        else if (option == "sort") {
            this.showImage(-40, 720);
        }
    }
    closeWait() {
        this.tempDisabled = false;
        document.getElementById("waitImage").remove();
    }
    generate(event) {
        if (this.checkInputParams()) {
            this.showWait("generate");
            let params = new HttpParams()
                .set('avoidDuplicates', "" + this.avoidDuplicates)
                .set('n', "" + this.numberOfItems)
                .set("maxValue", "" + this.maxValue);
            this.http.get(config.appPath, { params })
                .subscribe(data => {
                this.generatedItems = "[" + data.toString() + "]";
                document.getElementById("items").textContent = this.generatedItems;
                this.closeWait();
            }, error => {
                this.generatedItems = "[]";
                document.getElementById("items").textContent = this.generatedItems;
                if (error.status == 400) {
                    if (error.error.message == undefined) {
                        alert("Bad request: cannot avoid duplicates when max value less than number of items");
                    }
                    else {
                        alert(error.error.message);
                    }
                }
                this.closeWait();
            });
        }
    }
    sort(event) {
        this.showWait("sort");
        let params = new HttpParams()
            .set("asc", this.asc ? "true" : "false")
            .set("sort", this.sortField);
        let headers = new HttpHeaders({
            "Content-Type": "application/json"
        });
        this.http.post(config.appPath, this.generatedItems, { params: params, headers: headers })
            .subscribe(data => {
            this.generatedItems = "[" + data["sortedItems"] + "]";
            document.getElementById("items").textContent = this.generatedItems;
            this.closeWait();
        }, error => this.closeWait());
    }
    checkInputParams() {
        let isOk = true;
        if (Number.isNaN(this.numberOfItems)) {
            isOk = false;
            alert("Number of items is not a number");
        }
        else if (this.numberOfItems == 0) {
            isOk = false;
            alert("Number of items equals zero");
        }
        else if (Number.isNaN(this.maxValue)) {
            isOk = false;
            alert("Max value is not a number");
        }
        else if (this.maxValue == 0) {
            isOk = false;
            alert("Max value equals zero");
        }
        else if (this.avoidDuplicates && this.maxValue < this.numberOfItems) {
            isOk = false;
            alert("Сannot avoid duplicates when max value less than number of items");
        }
        return isOk;
    }
};
SortGenerationComponent = tslib_1.__decorate([
    NgModule({
        imports: [
            BrowserModule,
            FormsModule,
            ReactiveFormsModule
        ]
    }),
    Component({
        selector: 'sort-generation',
        templateUrl: './sort-generation.component.html',
        styleUrls: ['./sort-generation.component.css']
    })
], SortGenerationComponent);
export { SortGenerationComponent };
//# sourceMappingURL=sort-generation.component.js.map