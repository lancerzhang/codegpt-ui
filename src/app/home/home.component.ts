import { Component, OnInit } from '@angular/core';
import { IOutputData } from 'angular-split';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  navSize: number;
  chatSize: number;

  ngOnInit() {
    this.navSize = + (localStorage.getItem('navSize') ?? "20");
    this.chatSize = + (localStorage.getItem('chatSize') ?? "80");
  }

  saveSizes(event: IOutputData) {
    const sizes: number[] = event.sizes.filter((size): size is number => typeof size === 'number');
    localStorage.setItem('navSize', sizes[0].toString());
    localStorage.setItem('chatSize', sizes[1].toString());
  }
}
