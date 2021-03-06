import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Tuple } from 'src/app/helper/utils';
import {
  buttonElements,
  menuElements,
  NavService,
} from '../navingation.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  sideNavOpened: boolean = false;
  showTabs: boolean = false;
  menuElements: Tuple<string, string, null>[];
  buttonElements: Tuple<string, string, string>[];

  private openedSub?: Subscription;
  constructor(private navService: NavService) {
    this.menuElements = menuElements;
    this.buttonElements = buttonElements;
  }

  ngOnInit() {
    this.openedSub = this.navService.sideNavOpened.subscribe((val) => {
      this.sideNavOpened = val;
    });
  }

  ngOnDestroy() {
    this.openedSub?.unsubscribe();
  }

  toggleNavbar() {
    this.navService.toggleSidenav();
  }
}
