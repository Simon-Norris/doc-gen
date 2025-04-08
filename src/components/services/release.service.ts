import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {interval} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReleaseService {

  constructor(public updates: SwUpdate) {
    if (this.updates.isEnabled) {
      interval(5000).subscribe(() =>
        this.updates.checkForUpdate().then((val) => {
          console.log('checking for updates. Found new updated :', val)
          if (val) {
            this.promptUser()
          }
        })
      );
    }
  }

  public checkForNewRelease(): void {
    console.log('checking for new');
    this.updates.versionUpdates.subscribe((event) => this.promptUser());
  }

  private promptUser(): void {
    console.log('updating to new version');
    this.updates.activateUpdate().then(() => {

      console.log('Reloading happening')
      document.location.reload();
      console.log('Reloading completed')
    });
  }
}
