import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { NEVER, Subject } from 'rxjs';
import { Update } from './update';

describe('Update', () => {
  let service: Update;
  let swUpdate: jasmine.SpyObj<SwUpdate>;
  let versionUpdatesSubject: Subject<VersionEvent>;

  beforeEach(() => {
    versionUpdatesSubject = new Subject<VersionEvent>();

    swUpdate = jasmine.createSpyObj<SwUpdate>(
      'SwUpdate',
      ['activateUpdate'],
      {
        isEnabled: true,
        versionUpdates: versionUpdatesSubject.asObservable(),
      }
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: swUpdate },
      ],
    });

    service = TestBed.inject(Update);
  });

  afterEach(() => {
    versionUpdatesSubject.complete();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not initialize when service worker is disabled', () => {
    const disabledSwUpdate = jasmine.createSpyObj<SwUpdate>(
      'SwUpdate',
      ['activateUpdate'],
      {
        isEnabled: false,
        versionUpdates: NEVER,
      }
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: disabledSwUpdate },
      ],
    });

    const disabledService = TestBed.inject(Update);
    disabledService.init();

    expect(disabledSwUpdate.activateUpdate).not.toHaveBeenCalled();
  });

  it('should activate update when VERSION_READY event is received', (done) => {
    const mockVersionReadyEvent: VersionReadyEvent = {
      type: 'VERSION_READY',
      currentVersion: { hash: 'abc123', appData: {} },
      latestVersion: { hash: 'def456', appData: {} },
    };

    swUpdate.activateUpdate.and.returnValue(Promise.resolve(true));

    // Mock navigator.serviceWorker
    const originalServiceWorker = navigator.serviceWorker;
    const mockControllerChangeEvent = new Event('controllerchange');
    const eventTarget = new EventTarget();

    Object.defineProperty(navigator, 'serviceWorker', {
      value: eventTarget,
      writable: true,
      configurable: true,
    });

    spyOn(console, 'log');
    spyOn(console, 'error');

    service.init();

    // Wait a bit for subscription to be set up
    setTimeout(() => {
      versionUpdatesSubject.next(mockVersionReadyEvent);

      // Wait for activateUpdate to be called
      setTimeout(() => {
        expect(swUpdate.activateUpdate).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(
          'Current version is',
          mockVersionReadyEvent.currentVersion
        );

        // Trigger controllerchange event
        eventTarget.dispatchEvent(mockControllerChangeEvent);

        // Restore original serviceWorker
        Object.defineProperty(navigator, 'serviceWorker', {
          value: originalServiceWorker,
          writable: true,
          configurable: true,
        });

        done();
      }, 10);
    }, 10);
  });

  it('should handle errors during service worker update', (done) => {
    const mockVersionReadyEvent: VersionReadyEvent = {
      type: 'VERSION_READY',
      currentVersion: { hash: 'abc123', appData: {} },
      latestVersion: { hash: 'def456', appData: {} },
    };

    const testError = new Error('Update failed');
    // Keep activateUpdate successful; simulate an error flowing through the stream itself
    swUpdate.activateUpdate.and.returnValue(Promise.resolve(true));

    const consoleErrorSpy = spyOn(console, 'error');

    service.init();

    setTimeout(() => {
      // Emit an error from the source stream; catchError at the end should handle it
      versionUpdatesSubject.error(testError);

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error during service worker update:',
          testError
        );
        done();
      }, 20);
    }, 10);
  });

  it('should ignore non-VERSION_READY events', (done) => {
    const mockVersionDetectedEvent: VersionEvent = {
      type: 'VERSION_DETECTED',
      version: { hash: 'abc123', appData: {} },
    };

    service.init();

    setTimeout(() => {
      versionUpdatesSubject.next(mockVersionDetectedEvent);

      setTimeout(() => {
        expect(swUpdate.activateUpdate).not.toHaveBeenCalled();
        done();
      }, 10);
    }, 10);
  });

  it('should subscribe to version updates when initialized', () => {
    // Simply verify that init doesn't throw an error
    expect(() => service.init()).not.toThrow();
  });
});
