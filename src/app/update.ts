import { inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { catchError, EMPTY, filter, fromEvent, switchMap, take, tap, } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Update {
  private readonly serviceWWorker = inject(SwUpdate);

  init() {
    if (!this.serviceWWorker.isEnabled) {
      return;
    }

    this.serviceWWorker.versionUpdates
      .pipe(
        filter(update => update.type === 'VERSION_READY'),
        tap((data) => {
          console.log('Current version is', data.currentVersion);

    }),
        switchMap(() => this.serviceWWorker.activateUpdate()),
        switchMap(() => fromEvent(navigator.serviceWorker, 'controllerchange').pipe(take(1))),
        catchError((error) => {
           console.error('Error during service worker update:', error);
           return EMPTY;
        })
    )
      .subscribe();

  }

}
